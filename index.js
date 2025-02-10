const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = 8000;

app.use(bodyParser.json());

// เก็บ user
let users = [];
let counter = 1;

/*
GET /users สำหรับ get users ทั้งหมดที
POST /user สำหรับสร้าง user ใหม่
PUT /user/:id สำหรับแก้ไข user ที่มี id ตามที่ระบุ
DELETE /user/:id สำหรับลบ user ที่มี id ตามที่ระบุ
*/

//path:get/user สำหรับ get users ทั้งหมดที่บันทึกไว้
app.get('/users',(req,res)=>{
    res.json(users);
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
