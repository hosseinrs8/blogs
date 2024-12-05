import {
  BadRequestException,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';

@Injectable()
export class ImageService {
  private readonly logger: LoggerService;
  private readonly imageDirectory = path.join(__dirname, '../../..', 'images');

  constructor() {
    this.logger = new Logger(this.constructor.name);
    if (!fs.existsSync(this.imageDirectory)) {
      fs.mkdirSync(this.imageDirectory);
    }
  }

  async save(url: string, name: string): Promise<string> {
    this.logger.debug('save image', { url, name });
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const imagePath = path.join(this.imageDirectory, name);
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);
      await promisify(stream.finished)(writer);
      return imagePath;
    } catch (error) {
      this.logger.error('error saving image', { error });
      throw new BadRequestException('ImageSavingFailed');
    }
  }
}
