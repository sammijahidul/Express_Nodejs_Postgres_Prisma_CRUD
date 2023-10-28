import "dotenv/config";
import express from 'express';
import prisma from "./db/db.config.js";
const app = express();

app.use(express.json());

// Creating a user
app.post("/api/v1/create/user", async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password
            }
        });
        res.status(201).json({
            status: 'success',
            data: {
                newUser
            }
        })
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error while creating a user'
        })
    }
});

// Getting all users
app.get("/api/v1/fetch/users", async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({});
        if(!allUsers) {
            return res.status(404).json({
                message: 'No user found'
            })
        };
        res.status(200).json({
            status: 'success',
            result: allUsers.length,
            data: {
                allUsers
            }
        })       
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while getting all user"
        })
    }
});

// Updating a user 
app.patch("/api/v1/update/user/:id", async (req, res) => {
    try {
        const user_id = req.params.id;
        const {firstName, lastName, email, password} = req.body;
        const updateUser = await prisma.user.update({ 
            where : {

                id: Number(user_id)
            },
            data : req.body
        });
        res.status(400).json({
            status: 'success',
            data: {
                updateUser
            }
        })     
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while updating data"
        })
    }
});

// Deleting a user
app.delete("/api/v1/remove/user/:id", async (req, res) => {
    try {
        const user_id = req.params.id;
        await prisma.user.delete({
            where:{
                id: Number(user_id)
            }
        });
        res.status(200).json({
            message: 'Deleted successfully'
        })
        
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while deleting a user"
        })
    }
})

// Creating a post
app.post("/api/v1/create/post", async (req, res) => {
    try {
        const { user_id, title, description } = req.body;
        const newPost = await prisma.Post.create({
            data: {
                user_id: Number(user_id),
                title,
                description,
            },
        });
        res.status(201).json({
            status: 'success',
            message: "Post created",
            data: {
                newPost
            }
        })       
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'failed',
            message: "Error while creating a post"
        })
    }
});

// Getting all post
app.get("/api/v1/fetch/posts", async (req, res) => {
    try {
        const allPosts = await prisma.Post.findMany({});

        res.status(200).json({
            status: 'success',
            data: {
                allPosts
            }
        })       
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error while getting posts'
        })       
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
})