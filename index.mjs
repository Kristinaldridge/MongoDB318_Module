import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs/promises'; 
import methodOverride from 'method-override';


const app = express();
const PORT = 3000;



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//this is for put and delete methods to alternate
app.use(methodOverride('_method'));



let nextPostId = 15;

function generateId(){
  return nextPostId++;
};

// my gGet route
app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile('./data/posts.json', 'utf8');
    const posts = JSON.parse(data);
    res.render('home', { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading posts.');
  }
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', async (req, res) => {
  const { title, content } = req.body;
  const newPost = { 
    id:generateId(),
    title, 
    content };

  try {
    const data = await fs.readFile('./data/posts.json', 'utf8');
    const posts = JSON.parse(data);
    posts.push(newPost);
    await fs.writeFile('./data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving post.');
  }
});


//Put request 
app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile('./data/posts.json', 'utf8');
    const posts = JSON.parse(data);
    const post = posts.find(p => p.id === parseInt(id));
    if (post) {
      res.render('post', { title: post.title, content: post.content });
    } else {
      res.status(404).send('Post not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading posts.');
  }
});

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    
    const data = await fs.readFile('./data/posts.json', 'utf8');
    let posts = JSON.parse(data);
    const index = posts.findIndex(post => post.id === parseInt(id));

    if (index !== -1) {
      posts[index].title = title;
      posts[index].content = content;

      await fs.writeFile('./data/posts.json', JSON.stringify(posts, null, 2));

      res.redirect('/');
    } else {
      res.status(404).send('Post not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating post.');
  }
});


app.get('/posts/:id/edit', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile('./data/posts.json', 'utf8');
    const posts = JSON.parse(data);
    const post = posts.find(p => p.id === parseInt(id));
    if (post) {
      res.render('edit', { id: post.id, title: post.title, content: post.content });
    } else {
      res.status(404).send('Post not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading posts.');
  }
});


// Delete request
app.post('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await fs.readFile('./data/posts.json', 'utf8');
    let posts = JSON.parse(data);

    
    const index = posts.findIndex(post => post.id === parseInt(id));

    if (index !== -1) {
      posts.splice(index, 1);

      await fs.writeFile('./data/posts.json', JSON.stringify(posts, null, 2));

      console.log(`Post with id ${id} successfully deleted.`);
      res.redirect('/');
    } else {
      res.status(404).send('Post not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting post.');
  }
});


app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});



