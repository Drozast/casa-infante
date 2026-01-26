import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface UploadedFileType {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':folder')
  @ApiOperation({ summary: 'Subir archivo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('folder') folder: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    const url = await this.uploadsService.uploadFile(file, folder);
    return { url };
  }

  @Delete(':folder/:filename')
  @ApiOperation({ summary: 'Eliminar archivo' })
  async deleteFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    await this.uploadsService.deleteFile(`/uploads/${folder}/${filename}`);
    return { message: 'Archivo eliminado' };
  }
}
