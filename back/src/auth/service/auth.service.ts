import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../../usuarios/service/usuarios.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existe = await this.usuariosService.buscarPorEmail(dto.email);
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.contrasenia, 10);

    await this.usuariosService.crear({
      ...dto,
      contrasenia: passwordHash,
    });

    return { mensaje: 'Usuario registrado exitosamente' };
  }

  async login(dto: LoginDto) {
    const user = await this.usuariosService.buscarPorEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const passValida = await bcrypt.compare(dto.contrasenia, user.contrasenia);
    if (!passValida) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}