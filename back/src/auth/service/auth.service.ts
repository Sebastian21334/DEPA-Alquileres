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
    const email = dto.email.trim().toLowerCase();

    // Mismo email normalizado para chequear duplicados y para guardar
    const existe = await this.usuariosService.buscarPorEmail(email);
    
    if (existe) {
      throw new ConflictException('El email ya está registrado');
    }

    // El hasheo y la asignación de rol (Admin si es el primer usuario)
    // quedan encapsulados en UsuariosService.crear — no se duplican acá.
    await this.usuariosService.crear({
      ...dto,
      email,
    });

    return { mensaje: 'Usuario registrado exitosamente' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    // Trae el usuario CON la contraseña hasheada (select: false por defecto)
    // y con el rol ya resuelto, vía query builder en el repo.
    const user = await this.usuariosService.validarUsuarioParaLogin(email, dto.contrasenia);

    // Mismo mensaje para "no existe" y "contraseña incorrecta"
    // → previene enumeración de usuarios
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passValida = await bcrypt.compare(dto.contrasenia, user.contrasenia);
    if (!passValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol?.nombre };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}