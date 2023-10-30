import "dotenv/config";
import express from 'express';
import prisma from "./db/db.config.js";
const app = express();

app.use(express.json());

// Create a user
app.post("/api/v1/create/user", async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if(existingUser) {
            res.status(404).json({
                message: "This email is already taken"
            })
        } else {
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
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error while creating a user'
        })
    }
});
// Get all users
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
// Get a user
app.get("/api/v1/fetch/user/:id", async (req, res) => {
    try {
        const user_id = req.params.id;
        const user = await prisma.user.findFirst({
            where : {
                id: Number(user_id)
            },
            include:{
                post: true
            }
        });
        res.status(200).json({
            status: "success",
            data:{
                user
            }
        })      
    } 
    catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error while getting data"
        })
    }
});
// Update a user 
app.patch("/api/v1/update/user/:id", async (req, res) => {
    try {
        const user_id = req.params.id;
        const {firstName, lastName, email, password} = req.body;
        const updateUser = await prisma.user.update({ 
            where : {

                id: Number(user_id)
            },
            data : {
                firstName,
                lastName,
                email,
                password
            }
        });
        res.status(200).json({
            status: 'success',
            data: {
                updateUser
            }
        })     
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while updating a user info."
        })
    }
});
// Delete a user
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

// Create a post
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
// Get all post
app.get("/api/v1/fetch/posts", async (req, res) => {
    try {
        const allPosts = await prisma.Post.findMany({
            include: {
                comment: {
                    include: {
                        user: {
                            select: {
                                firstName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: 'desc'
            },
            where: {
                comment_count: {
                    gt: 0
                }
            }
        });

        res.status(200).json({
            status: 'success',
            Total_found: allPosts.length,
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
// Get a post
app.get("/api/v1/fetch/post/:id", async (req, res) => {
    try {
        const post_id = req.params.id
        const post = await prisma.post.findFirst({
            where: {
                id: Number(post_id)
            },
            include: {
                comment: {
                    include: {
                        user: {
                            select: {
                                firstName: true
                            }
                        }
                    }
                }
            }
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                post
            }
        })       
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while getting a post"
        })
    }
});
// Update a post
app.patch("/api/v1/update/post/:id", async (req, res) => {
    try {
        const post_id = req.params.id;
        const {user_id, title, description} = req.body;
        const updatedPost = await prisma.post.update({
            where: {
                id: Number(post_id)
            },
            data: {
                user_id,
                title,
                description
            },
        });

        res.status(200).json({
            status: "success",
            data: {
                updatedPost
            }
        });     
    } 
    catch (error) {
        console.error(error);
        res.status(500).json*{
            message: "Error while updating a post"
        }
    }
});
// Delete a post
app.delete("/api/v1/remove/post/:id", async (req, res) => {
    try {
        const post_id = req.params.id;
        await prisma.post.delete({
            where: {
                id: Number(post_id)
            }
        });
        
        res.status(200).json({
            message: "Deleted Successfully"
        })
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while deleting a post"
        })
    }
});

// Create a comment
app.post("/api/v1/comment", async (req, res) => {
    try {
        const {post_id, user_id, comment} = req.body;
        // comment count increase on post while comment created
        await prisma.post.update({
            where: {
                id: Number(post_id)
            },
            data: {
                comment_count: {
                    increment: 1
                }
            }
        });
        const newComment = await prisma.comment.create({
            data: {
                post_id: Number(post_id),
                user_id: Number(user_id),
                comment
            }
        });
        res.status(201).json({
            status: 'success',
            data: {
                newComment
            }
        })       
    } 
    catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error while creating a comment"
        })
    }
});
// Get a comment
app.get("/api/v1/fetch/comment/:id", async (req, res) => {
    try {
        const comment_id = req.params.id;
        const comment = await prisma.comment.findFirst({
            where: {
                id: comment_id
            },
            include: {
                post: true
            },
        });

        res.status(200).json({
            status: "success",
            data: {
                comment
            }
        })
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while getting a comment"
        })
    }
});
// Get all comments
app.get("/api/v1/fetch/comments", async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            include: {
                post: true
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                comments
            }
        })       
    } 
    catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error while creating a comment"
        })
    }
});
// Update a comment
app.patch("/api/v1/comment/update/:id", async (req, res) => {
    try {
        const comment_id = req.params.id;
        const {post_id, user_id, comment} = req.body;
        const updatedComment = await prisma.comment.update({
            where: {
                id: comment_id
            },
            data: {
                post_id,
                user_id,
                comment
            }
        });

        res.status(200).json({
            status: "success",
            data: {
                updatedComment
            }
        });    
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while updating a comment"
        })
    }
});
// Delete a comment
app.delete("/api/v1/remove/comment/:post_id/:comment_id", async (req, res) => {
    try {
        const post_id = req.params.post_id;
        const comment_id = req.params.comment_id;
        await prisma.post.update({
            where: {
                id: Number(post_id)
            },
            data: {
                comment_count: {
                    decrement: 1
                }
            }
        });
        await prisma.comment.delete({
            where: {
                id: comment_id
            }
        });

        res.status(200).json({
            message: "Successfully deleted"
        });       
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error while deleting a comment"
        })
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
})