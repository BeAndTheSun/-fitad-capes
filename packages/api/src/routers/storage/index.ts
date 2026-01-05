import { config } from '@/api/config';
import { MAX_UPLOAD_FILE_SIZE } from '@/api/constants';
import { ctx } from '@/api/context';
import { StorageProvider } from '@/api/enums';
import {
  deleteFileS3,
  getFileUrlS3,
  getUploadFileUrlS3,
} from '@/api/utils/aws';
import { uploadFileVercelBlob } from '@/api/utils/vercel';
import { deleteFileVercelBlob } from '@/api/utils/vercel/delete';
import { getFileUrlVercelBlob } from '@/api/utils/vercel/get-url';

import { storageApiDef } from './def';

export const storageRouter = ctx.router(storageApiDef);

storageRouter.get('/files/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  let url = null;
  const { provider } = config.storage;
  if (provider === StorageProvider.AWS) {
    url = await getFileUrlS3(req.params.id);
  } else if (provider === StorageProvider.VERCEL) {
    url = getFileUrlVercelBlob(req.params.id);
  } else {
    return res.status(400).json({ error: 'Invalid storage provider' });
  }

  if (url) {
    return res.status(200).json({ url });
  }
  return res.status(404).json({ error: 'File not found' });
});

storageRouter.delete('/files/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const { provider } = config.storage;
  if (provider === StorageProvider.AWS) {
    await deleteFileS3(req.params.id);
    return res.status(200).end();
  }
  if (provider === StorageProvider.VERCEL) {
    await deleteFileVercelBlob(req.params.id);
  }
  return res.status(400).json({ error: 'Invalid storage provider' });
});

storageRouter.post('/files/upload', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  if (req.body.contentLength > MAX_UPLOAD_FILE_SIZE) {
    return res.status(400).json({ error: 'Max file size exceeded' });
  }
  const { provider } = config.storage;
  if (provider === StorageProvider.AWS) {
    const data = await getUploadFileUrlS3({
      fileExtension: req.body.fileExtension,
      contentLength: req.body.contentLength,
    });
    return res.status(200).json(data);
  }
  return res.status(400).json({ error: 'Invalid storage provider' });
});

storageRouter.post('/files/upload/vercel', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const data = await uploadFileVercelBlob({
      body: req.body,
      request: req,
      allowedContentTypes: ['image/jpeg', 'image/png'],
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message });
  }
});
