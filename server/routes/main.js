const express = require('express')
const router = express.Router()
const Post = require('../models/Posts')

// routers
// router.get('', async (req, res)=>{
//     // res.send('Hello')
//     const locals = {
//         title: 'NodeJS blog',
//         desc:'Simple node js blogs'
//     }
//     try {
//         const data = await Post.find()
//         res.render('index', {locals, data})
//     } catch (error) {
//         console.log(error)
//     }
//     // res.render('index', {locals})
// })

// with pagination
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'NodeJS blog',
            desc: 'Simple node js blogs'
        }


        let perPage = 10
        let page = req.query.page || 1

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec()

        const count = await Post.count()
        const nextPage = parseInt(page) + 1
        const hasNextPage = nextPage <= Math.ceil(count / perPage)

        res.render('index',
            {
                locals,
                data,
                current: page,
                nextPage: hasNextPage ? nextPage : null,
                currentRoute: '/'
            })
    } catch (error) {
        console.log(error)
    }
})


router.get('/post/:id', async (req, res)=>{

    try {
        let slug = req.params.id
        const data = await Post.findById({_id:slug})
        const locals = {
            title: data.title,
            desc:'Simple node js blogs',
            currentRoute: `/post/${slug}`
        }
        res.render('post', {locals, data})
    } catch (error) {
        console.log(error)
    }
})


router.post('/search', async (req, res)=>{
    try {
    const locals = {
        title: 'Search',
        desc:'Simple node js blogs'
    }
    let searchTerm = req.body.searchTerm
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
      ]
    });
    res.render('search',{
        data,
        locals
    })
    } catch (error) {
        console.log(error)
    }
})


// function insertPostData() {
//     Post.insertMany([
//         {
//             title:'Building blog 101',
//             body:'This is the body 111'
//         },
//         {
//             title:'Building blog 222',
//             body:'This is the body 222'
//         },
//         {
//             title:'Building blog 333',
//             body:'This is the body 333'
//         },
//         {
//             title:'Building blog 355',
//             body:'This is the body 355'
//         },
//     ])
// }
// insertPostData()


router.get('/about', (req, res) => {
    // res.send('Hello')
    res.render('about',{
        currentRoute:'/about'
    })
})

module.exports = router