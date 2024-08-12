import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { imageName } = req.query;
  const imagePath = path.join(process.cwd(), 'public', 'ribxz_pics', imageName);

  if (fs.existsSync(imagePath)) {
    res.status(200).json({ exists: true });
  } else {
    res.status(200).json({ exists: false });
  }
}