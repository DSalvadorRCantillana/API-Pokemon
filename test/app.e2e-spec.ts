import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API Pokemon (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /pokemon devuelve una lista', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pokemon')
      .expect(200);

    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  it('GET /pokemon/tipo devuelve una lista', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/pokemon/tipo')
      .expect(200);

    expect(Array.isArray(respuesta.body)).toBe(true);
  });

  it('GET /pokemon/abc responde 400 por id inválido', () => {
    return request(app.getHttpServer()).get('/pokemon/abc').expect(400);
  });
});