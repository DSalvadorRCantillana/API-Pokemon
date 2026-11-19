import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service.js';

describe('PokemonService', () => {
  let service: PokemonService;
  // Repositorios falsos: cada método es una función que controlamos en el test
  let pokemonRepo: Record<string, ReturnType<typeof vi.fn>>;
  let tipoRepo: Record<string, ReturnType<typeof vi.fn>>;

  const fuego = { id: 1, nombre: 'Fuego' };
  const agua = { id: 2, nombre: 'Agua' };

  beforeEach(() => {
    pokemonRepo = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };
    tipoRepo = {
      findBy: vi.fn(),
      findOneBy: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };
    // "as never" solo evita quejas de tipos con los repositorios falsos
    service = new PokemonService(pokemonRepo as never, tipoRepo as never);
  });

  describe('create', () => {
    it('crea el pokemon con los tipos indicados', async () => {
      tipoRepo.findBy.mockResolvedValue([fuego]);
      pokemonRepo.create.mockImplementation((datos: object) => datos);
      pokemonRepo.save.mockImplementation(async (p: object) => ({ id: 1, ...p }));

      const resultado = await service.create({
        nombre: 'Charmander',
        descripcion: 'Lagartija',
        tipos: [1],
      });

      expect(resultado).toEqual({
        id: 1,
        nombre: 'Charmander',
        descripcion: 'Lagartija',
        types: [fuego],
      });
    });

    it('lanza BadRequest si algún tipo no existe', async () => {
      tipoRepo.findBy.mockResolvedValue([]);

      await expect(
        service.create({ nombre: 'X', descripcion: 'Y', tipos: [99] }),
      ).rejects.toThrow(BadRequestException);
      expect(pokemonRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('devuelve el pokemon si existe', async () => {
      const pokemon = { id: 1, nombre: 'Charmander', types: [fuego] };
      pokemonRepo.findOne.mockResolvedValue(pokemon);

      expect(await service.findOne(1)).toEqual(pokemon);
    });

    it('lanza NotFound si no existe', async () => {
      pokemonRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('actualiza solo los campos enviados', async () => {
      const existente = { id: 1, nombre: 'Charmander', descripcion: 'Vieja', types: [fuego] };
      pokemonRepo.findOne.mockResolvedValue(existente);
      pokemonRepo.save.mockImplementation(async (p: object) => p);

      const resultado = await service.update(1, { descripcion: 'Nueva' });

      expect(resultado).toMatchObject({ nombre: 'Charmander', descripcion: 'Nueva' });
      expect(tipoRepo.findBy).not.toHaveBeenCalled();
    });

    it('reemplaza los tipos si se envían', async () => {
      const existente = { id: 1, nombre: 'Charmander', descripcion: 'D', types: [fuego] };
      pokemonRepo.findOne.mockResolvedValue(existente);
      tipoRepo.findBy.mockResolvedValue([agua]);
      pokemonRepo.save.mockImplementation(async (p: object) => p);

      const resultado = await service.update(1, { tipos: [2] });

      expect(resultado.types).toEqual([agua]);
    });

    it('lanza BadRequest si algún tipo no existe', async () => {
      pokemonRepo.findOne.mockResolvedValue({ id: 1, types: [] });
      tipoRepo.findBy.mockResolvedValue([]);

      await expect(service.update(1, { tipos: [99] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza NotFound si el pokemon no existe', async () => {
      pokemonRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('elimina el pokemon y devuelve un mensaje', async () => {
      const existente = { id: 1, nombre: 'Charmander', types: [] };
      pokemonRepo.findOne.mockResolvedValue(existente);
      pokemonRepo.remove.mockResolvedValue(existente);

      const resultado = await service.remove(1);

      expect(pokemonRepo.remove).toHaveBeenCalledWith(existente);
      expect(resultado).toEqual({ mensaje: 'Pokemon con id 1 eliminado' });
    });

    it('lanza NotFound si no existe', async () => {
      pokemonRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('tipos', () => {
    it('findOneTipo lanza NotFound si no existe', async () => {
      tipoRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOneTipo(999)).rejects.toThrow(NotFoundException);
    });

    it('updateTipo cambia el nombre', async () => {
      tipoRepo.findOneBy.mockResolvedValue({ id: 1, nombre: 'Fuego' });
      tipoRepo.save.mockImplementation(async (t: object) => t);

      const resultado = await service.updateTipo(1, { nombre: 'Llama' });

      expect(resultado.nombre).toBe('Llama');
    });

    it('removeTipo lanza Conflict si un pokemon lo usa', async () => {
      tipoRepo.findOne.mockResolvedValue({ ...fuego, pokemons: [{ id: 1 }] });

      await expect(service.removeTipo(1)).rejects.toThrow(ConflictException);
      expect(tipoRepo.remove).not.toHaveBeenCalled();
    });

    it('removeTipo elimina un tipo que no está en uso', async () => {
      const libre = { ...fuego, pokemons: [] };
      tipoRepo.findOne.mockResolvedValue(libre);
      tipoRepo.remove.mockResolvedValue(libre);

      const resultado = await service.removeTipo(1);

      expect(tipoRepo.remove).toHaveBeenCalledWith(libre);
      expect(resultado).toEqual({ mensaje: 'Tipo con id 1 eliminado' });
    });

    it('removeTipo lanza NotFound si no existe', async () => {
      tipoRepo.findOne.mockResolvedValue(null);

      await expect(service.removeTipo(999)).rejects.toThrow(NotFoundException);
    });
  });
});