import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Wrapper pequeño: delega toda la validación de Bearer/JWT a Passport.
export class JwtAuthGuard extends AuthGuard('jwt') {}