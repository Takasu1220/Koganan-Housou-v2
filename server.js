const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB接続（環境変数から読み込み）
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// データのスキーマ定義
const ItemSchema = new mongoose.Schema({
  text: String,
  checked: Boolean
});
const Item = mongoose.model('Item', ItemSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// データ全取得API
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).send(err);
  }
});

// データ追加API
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item({ text: req.body.text, checked: false });
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

// チェックロックAPI（更新）
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, 
      { checked: true }, 
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

// データ削除API
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send(err);
  }
});

// フロントのHTMLを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));