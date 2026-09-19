import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const auth = { isAuthenticated: false, isAdmin: false };

  beforeEach(() => {
    auth.isAuthenticated = false;
    auth.isAdmin = false;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  function ejecutarGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot),
    );
  }

  it('envía al login cuando no hay una sesión activa', () => {
    const resultado = ejecutarGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login?returnUrl=%2Fadmin');
  });

  it('muestra el 403 cuando hay sesión pero falta el rol administrador', () => {
    auth.isAuthenticated = true;
    const resultado = ejecutarGuard() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/403');
  });

  it('permite ingresar a un administrador', () => {
    auth.isAuthenticated = true;
    auth.isAdmin = true;
    expect(ejecutarGuard()).toBe(true);
  });
});
