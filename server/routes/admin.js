const express = require('express')
const router = express.Router()
const Post = require('../models/Posts')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const admin_layout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRECT

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      desc: 'Simple node js blogs'
    }
    res.render('admin/index', { locals, layout: admin_layout })
  } catch (error) {
    console.log(error)
  }
})

// Check login
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

router.get('/dashboard', authMiddleware, async (req, res) => {

  try {
    const locals = {
      title: 'Dashboard',
      desc: 'Simple NodeJS Blog'
    }
    const data = await Post.find()
    res.render('admin/dashboard', {
      locals, data, layout: admin_layout
    })
  } catch (error) {
    console.log(error)
  }

})

router.get('/add-post', authMiddleware, async (req, res) => {

  try {
    const locals = {
      title: 'Add Post',
      desc: 'Simple NodeJS Blog'
    }
    const data = await Post.find()
    res.render('admin/add-post', {
      locals, layout: admin_layout
    })
  } catch (error) {
    console.log(error)
  }

})

router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    try {
      locals={
        title:'Edit Post',
        desc:'This is nodejs blog'
      }
      const data = await Post.findOne({_id: req.params.id})
      res.render('admin/edit-post',{
        locals,
        data,
        layout: admin_layout
      });
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    try {
      await Post.findByIdAndUpdate(req.params.id, {
        title:req.body.title,
        body:req.body.body,
        updatedAt: Date.now()
      })
      res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

// router.post('/admin', async (req, res)=>{
//     try {
//         const {username, password} = req.body
//         if(req.body.username === 'admin' && req.body.password === 'password'){
//             res.send('You are already logged in.')
//         }else{
//             res.send('Worng username and password')
//         }
//         console.log(req.body)
//         // res.render('admin/index', {locals, layout: admin_layout})
//     } catch (error) {
//         console.log(error)
//     }
// })

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const hasPssword = await bcrypt.hash(password, 10)
    try {
      const user = await User.create({ username, password: hasPssword })
      res.status(201).json({ message: 'User Created', user })
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'User alredy exist' })
      }
      res.status(500).json({ message: 'Inter server error' })
      console.log(error)
    }
    console.log(req.body)
    // res.render('admin/index', {locals, layout: admin_layout})
  } catch (error) {
    console.log(error)
  }
})

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});


module.exports = router
