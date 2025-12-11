import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/public.decorator';


@Controller('health')
export class HealthController {
    @Public()
    @Get()
    check() {
        console.log('Health check endpoint called');
        return { status: 'healthy' };
    }
}