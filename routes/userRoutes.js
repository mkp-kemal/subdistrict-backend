import express from 'express'
import { getNavbarData } from '../controllers/navbar.controller.js'
import { createBlog, deleteBlog, getBlogByTitle, getBlogs, updateBlog } from '../controllers/blog.controller.js'
import { deleteImage, getImages, upload } from '../helper/multerConfig.js'
import { login, logout, user, users } from '../controllers/login.controller.js'
import protectRoute from '../middlewares/protectRoute.js'
import { createAgenda, deleteAgenda, getAgendas, updateAgenda } from '../controllers/agenda.controller.js'


const router = express.Router()

router.get('/navbar', getNavbarData)
router.get('/blogs', getBlogs)
router.get('/agenda', getAgendas)
router.get('/blog/:title', getBlogByTitle)


//credentials
router.post('/login', login)
router.post('/logout', protectRoute, logout)
router.get('/user', protectRoute, user)
router.get('/users', protectRoute, users)
router.get('/images', getImages)
router.delete('/images', protectRoute, deleteImage);
router.post('/post', protectRoute, upload.single('image'), createBlog);
router.post('/post/agenda', protectRoute, createAgenda);
router.put('/blog/:id', protectRoute, upload.single('image'), updateBlog)
router.put('/agenda/:id', protectRoute, updateAgenda)
router.delete('/blog/:id', protectRoute, deleteBlog)
router.delete('/agenda/:id', protectRoute, deleteAgenda)

export default router