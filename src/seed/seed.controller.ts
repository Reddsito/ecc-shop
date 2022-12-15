import { Controller, Get} from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger/dist/decorators';


@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @ApiTags('Seed')
  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }


}
