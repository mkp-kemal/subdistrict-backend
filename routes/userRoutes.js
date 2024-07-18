import express from 'express'
import { getNavbarData } from '../controllers/navbar.controller.js'
import { createBlog, deleteBlog, getBlogByTitle, getBlogs, updateBlog } from '../controllers/blog.controller.js'
import upload from '../helper/multerConfig.js'


const router = express.Router()

router.get('/navbar', getNavbarData)
router.post('/post', upload.single('image'), createBlog)
router.get('/blogs', getBlogs)
router.put('/blog/:id', upload.single('image'), updateBlog)
router.get('/blog/:title', getBlogByTitle)
router.delete('/blog/:id', deleteBlog)
// router.post('/create/hadits', createHadits)
// router.get('/hadits/:reference', getHaditsByReference)

export default router