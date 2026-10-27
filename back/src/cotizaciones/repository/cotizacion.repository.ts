import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CotizacionDolar } from '../entity/cotizacion-dolar.entity';
import { ConsultaCotizacion } from '../entity/consulta-cotizacion.entity';
import type { ICotizacionRepository } from './cotizacion.repository.interface';

@Injectable()
export class CotizacionRepository implements ICotizacionRepository {
  constructor(
    @InjectRepository(CotizacionDolar)
    private readonly repo: Repository<CotizacionDolar>,
  ) {}
  ultima() {
    return this.repo.findOne({ where: {}, order: { id: 'DESC' } });
  }
  ultimaConsulta() {
    return this.repo.manager
      .getRepository(ConsultaCotizacion)
      .findOne({ where: {}, order: { id: 'DESC' } });
  }
  guardar(datos: Partial<CotizacionDolar>) {
    return this.repo.save(this.repo.create(datos));
  }
  async registrarConsulta(exitosa: boolean, error: string | null) {
    await this.repo.manager
      .getRepository(ConsultaCotizacion)
      .insert({ exitosa, error });
  }
  async historial(
    desde: Date | undefined,
    hasta: Date | undefined,
    pagina: number,
  ) {
    const consulta = this.repo.createQueryBuilder('cotizacion');
    if (desde)
      consulta.andWhere('cotizacion.consultada_en >= :desde', { desde });
    if (hasta)
      consulta.andWhere('cotizacion.consultada_en < :hasta', { hasta });
    const [items, total] = await consulta
      .orderBy('cotizacion.id', 'DESC')
      .skip((pagina - 1) * 25)
      .take(25)
      .getManyAndCount();
    return { items, total };
  }
  consultas() {
    return this.repo.manager
      .getRepository(ConsultaCotizacion)
      .find({ order: { id: 'DESC' }, take: 20 });
  }
  conBloqueo<T>(
    operacion: (repo: ICotizacionRepository) => Promise<T>,
  ): Promise<T> {
    return this.repo.manager.transaction(async (manager) => {
      await manager.query("SET LOCAL lock_timeout = '8s'");
      // El bloqueo pertenece a esta transacción/conexión: también funciona entre réplicas
      // y PostgreSQL lo libera al finalizar la transacción o perder la conexión.
      await manager.query('SELECT pg_advisory_xact_lock(194701, 1)');
      return operacion(
        new CotizacionRepository(manager.getRepository(CotizacionDolar)),
      );
    });
  }
}
