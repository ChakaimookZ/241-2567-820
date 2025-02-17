const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();

app.use(bodyParser.json());
const port = 8000;

// เก็บ user
let users = [];
let counter = 1;

/*
GET /users สำหรับ get users ทั้งหมดที
POST /user สำหรับสร้าง user ใหม่
PUT /user/:id สำหรับแก้ไข user ที่มี id ตามที่ระบุ
DELETE /user/:id สำหรับลบ user ที่มี id ตามที่ระบุ
*/

app.get('/testdb-new', async (req, res) => {
    const conn = await mysql.createConnection({
        host: 'mysql_db_830',
        user:'root',
        password: 'root',
        database: 'webdb',
        port: 3306
    }).then((conn) => {
        conn
        .query('SELECT * FROM users')
        .then((results) => {
            res.json(results[0])
        })
    }).catch((error) => {
            console.log('Error frtching users:', error.message)
            res.status(500).json({error:'Error frtching usersdddddddddddd'})
        })
    })

app.get('/testdb', async (req, res) => {
        try {
            const [results] = await conn.query('SELECT * FROM users');
            res.json(results);
        } catch (error) {
            console.log('Error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });

app.get('/testdbnew', async (req, res) => {
        try {
            const [results] = await conn.query('SELECT idx FROM users');
            res.json(results);
        } catch (error) {
            console.log('Error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });
    
//path:get/user สำหรับ get users ทั้งหมดที่บันทึกไว้
app.get('/users', async (req, res) => {
    try {
        const [results] = await conn.query('SELECT * FROM users');
        res.json(results);
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

//path = POST /user
app.post('/user',(req,res)=>{
    let user = req.body;
    user.id = counter
    counter++;
    users.push(user);
    res.json({
        message: 'Create new user successfully',
        user: user,
    });
})

// path = PUT /user/:id
app.put('/user/:id',(req,res)=>{
    let id = req.params.id;
    let updateUser = req.body;
    // หา index ของ user ที่ต้องการแก้ไข
    let selectedIndex = users.findIndex(user=>user.id == id);

    // update ข้อมูล user
    if(updateUser.firstname){
        users[selectedIndex].firstname = updateUser.firstname;
    }
    if(updateUser.lastname){
        users[selectedIndex].lastname = updateUser.lastname;
    }

    res.json({
        message: 'Update user successfully',
        data : {
            user : updateUser,
            indexUpdated : selectedIndex
        }
    });
});

// path = DELETE /user/:id
app.delete('/user/:id',(req,res)=>{
    let id = req.params.id;
    //หา index ของ user ที่ต้องการลบ
    let selectedIndex = users.findIndex(user=>user.id == id);

    //ลบ user ที่ต้องการ
    users.splice(selectedIndex,1);
    res.json({
        message: 'Delete user successfully',
        indexDeleted: selectedIndex
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
