import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const raiz = join(process.cwd(), 'src');
function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(dir, entrada.name);
    return entrada.isDirectory()
      ? archivos(ruta)
      : ruta.endsWith('.ts') && !ruta.endsWith('.spec.ts')
        ? [ruta]
        : [];
  });
}

describe('Límites de la arquitectura de tres capas', () => {
  it('mantiene persistencia y SDKs externos fuera de controladores, guards y servicios de negocio', () => {
    const violaciones: string[] = [];
    for (const archivo of archivos(raiz)) {
      const ruta = relative(raiz, archivo).replaceAll('\\', '/');
      if (!/(controller|guards|service)\//.test(ruta)) continue;
      const fuente = ts.createSourceFile(
        archivo,
        readFileSync(archivo, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      for (const nodo of fuente.statements) {
        if (
          !ts.isImportDeclaration(nodo) ||
          !ts.isStringLiteral(nodo.moduleSpecifier)
        )
          continue;
        const dependencia = nodo.moduleSpecifier.text;
        if (
          /^(typeorm|@nestjs\/typeorm|@azure\/|mercadopago|@tensorflow\/|@vladmandic\/)/.test(
            dependencia,
          )
        ) {
          violaciones.push(`${ruta} importa ${dependencia}`);
        }
        if (/controller\//.test(ruta) && /\/repository\//.test(dependencia)) {
          violaciones.push(`${ruta} salta la capa de negocio`);
        }
      }
    }
    expect(violaciones).toEqual([]);
  });

  it('impide dependencias desde repositorios hacia controladores o servicios', () => {
    const violaciones: string[] = [];
    for (const archivo of archivos(raiz).filter((ruta) =>
      /[\\/]repository[\\/]/.test(ruta),
    )) {
      const fuente = ts.createSourceFile(
        archivo,
        readFileSync(archivo, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      for (const nodo of fuente.statements) {
        if (
          ts.isImportDeclaration(nodo) &&
          ts.isStringLiteral(nodo.moduleSpecifier) &&
          /\/(controller|service)\//.test(nodo.moduleSpecifier.text)
        ) {
          violaciones.push(relative(raiz, archivo));
        }
      }
    }
    expect(violaciones).toEqual([]);
  });

  it('decide si una publicación es del usuario solo en la entidad Publicacion', () => {
    const violaciones: string[] = [];
    for (const archivo of archivos(raiz)) {
      const ruta = relative(raiz, archivo).replaceAll('\\', '/');
      if (ruta === 'publicaciones/entity/publicacion.entity.ts') continue;
      const fuente = ts.createSourceFile(
        archivo,
        readFileSync(archivo, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      const visitar = (nodo: ts.Node): void => {
        if (
          ts.isBinaryExpression(nodo) &&
          [
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.SyntaxKind.ExclamationEqualsEqualsToken,
          ].includes(nodo.operatorToken.kind) &&
          /anunciante\??\.(idUsuario|usuario\??\.id)\b/.test(nodo.getText())
        )
          violaciones.push(`${ruta}: ${nodo.getText()}`);
        ts.forEachChild(nodo, visitar);
      };
      visitar(fuente);
    }
    // Usar publicacion.perteneceA() o PublicacionesService.obtenerPropia().
    expect(violaciones).toEqual([]);
  });

  it('no permite tipos any explícitos en el código de producción', () => {
    const violaciones: string[] = [];
    for (const archivo of archivos(raiz)) {
      const fuente = ts.createSourceFile(
        archivo,
        readFileSync(archivo, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      const visitar = (nodo: ts.Node): void => {
        if (nodo.kind === ts.SyntaxKind.AnyKeyword)
          violaciones.push(relative(raiz, archivo));
        ts.forEachChild(nodo, visitar);
      };
      visitar(fuente);
    }
    expect(violaciones).toEqual([]);
  });
});
