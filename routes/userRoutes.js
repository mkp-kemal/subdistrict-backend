import express from 'express'
import { getNavbarData } from '../controllers/navbar.controller.js'
import { createBlog, deleteBlog, getBlogByTitle, getBlogs, updateBlog } from '../controllers/blog.controller.js'
import { upload } from '../helper/multerConfig.js'
import { login, logout } from '../controllers/login.controller.js'
import protectRoute from '../middlewares/protectRoute.js'


const router = express.Router()

router.get('/navbar', getNavbarData)
router.post('/post', protectRoute, upload.single('image'), createBlog);
router.get('/blogs', getBlogs)
router.put('/blog/:id', upload.single('image'), updateBlog)
router.get('/blog/:title', getBlogByTitle)
router.delete('/blog/:id', deleteBlog)

//credentials
router.post('/login', login)
router.post('/logout', protectRoute, logout)

export default router