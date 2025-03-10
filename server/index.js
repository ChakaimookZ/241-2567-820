const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

const port = 8000;

app.use(bodyParser.json());
app.use(cors());

let conn = null;


const initMYSQL = async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',  // ใช้ localhost หรือ 127.0.0.1
            user: 'root',
            password: 'root',
            database: 'webdb',
            port: 8830,  // พอร์ตที่ map จาก Docker (8830)
        });
        console.log('MySQL connected successfully!');
    } catch (err) {
        console.error('MySQL Connection Error:', err.message);
    }
};

initMYSQL();


const validateData = (userData) => {
    let errors = []

    if (!userData.firstname) {
        errors.push('กรุณากรอกชื่อ')
    }
    if (!userData.lastname) {
        errors.push('กรุณากรอกนามสกุล')
    }
    if (!userData.age) {
        errors.push('กรุณากรอกอายุให้ถูกต้อง')
    }
    if (!userData.gender) {
        errors.push('กรุณาเลือกเพศ')
    }
    if (!userData.description) {
        errors.push('กรุณากรอกรายละเอียด')
    }

    return errors;
}

const submitData = async () => {
    let firstnameDOM = document.querySelector('input[name=firstname]')
    let lastnameDOM = document.querySelector('input[name=lastname]')
    let ageDOM = document.querySelector('input[name=age]')
    let genderDOM  = document.querySelector('input[name=gender]:checked') || {}
    let interestDOMs = Array.from(document.querySelectorAll('input[name=interest]:checked')) ||{}
    let descriptionDOM = document.querySelector('textarea[name=description]')

    let messageDOM = document.getElementById('message')

    try {
        let interest = interestDOMs.map(el => el.value).join(',')

        let userData = {
            firstname : firstnameDOM.value,
            lastname : lastnameDOM.value,
            age : ageDOM.value,
            gender : genderDOM.value,
            description : descriptionDOM.value,
            interests : interest
        }

        console.log('submitData', userData)
        const errors = validateData(userData)

        if (errors.length > 0) {
            throw {
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                errors: errors
            }
        }

        const response = await axios.post('http://localhost:8000/users', userData);
        console.log('response', response.data);
        
        messageDOM.innerText = 'บันทึกข้อมูลเรียบร้อย';
        messageDOM.className = 'message success';
    } catch (error) {
        let htmlData = '<div>';
        htmlData += `<div> ${error.message} </div>`;
        htmlData += '<ul>';

        if (error.errors) {
            for (let i = 0; i < error.errors.length; i++) {
                htmlData += `<li> ${error.errors[i]} </li>`;
            }
        }

        htmlData += '</ul>';
        htmlData += '</div>';
        
        messageDOM.innerText = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        messageDOM.className = 'message danger';
    }
};

const checkDBConnection = (req, res, next) => {
    if (!conn) {
        return res.status(500).json({ error: ' MySQL Not Connected!' });
    }
    next();
};

//  เชื่อมต่อ MySQL ก่อนเริ่มเซิร์ฟเวอร์
app.listen(port, async () => {
    await initMYSQL();
    console.log(' Server is running on port ' + port);
});

//  ใช้ middleware `checkDBConnection` ก่อนเรียก API
app.use(checkDBConnection);

//  GET /users - ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
    try {
        const [results] = await conn.query('SELECT * FROM users');
        res.json(results);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

//  POST /users - สร้างผู้ใช้ใหม่
app.post('/users', async (req, res) => {
    try {
        let user = req.body;
        const [result] = await conn.query('INSERT INTO users SET ?', user);
        res.json({
            message: ' Create user successfully',
            data: result
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            message: ' Something went wrong',
            errorMessage: error.message 
        });
    }
});

//  GET /users/:id - ดึงข้อมูลผู้ใช้ตาม ID
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const [results] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: ' User not found' });
        }

        res.json(results[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

//  PUT /users/:id - อัปเดตข้อมูลผู้ใช้
app.put('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let updateUser = req.body;
        const [result] = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser, id]);

        res.json({
            message: ' Update user successfully',
            data: result
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /users/:id - ลบผู้ใช้
app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const [result] = await conn.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            message: ' Delete user successfully',
            data: result
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});