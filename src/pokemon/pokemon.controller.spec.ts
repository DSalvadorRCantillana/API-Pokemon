import { PokemonController } from './pokemon.controller.js';

describe('PokemonController', () => {
  let controller: PokemonController;
  // Servicio falso: solo comprobamos que el controlador le pasa bien los datos
  const servicio = {
    create: vi.fn(),
    createTipo: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    findAllTipos: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PokemonController(servicio as never);
  });

  it('findAll devuelve lo que entrega el servicio', async () => {
    servicio.findAll.mockResolvedValue([{ id: 1 }]);

    expect(await controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('findOne pasa el id al servicio', async () => {
    servicio.findOne.mockResolvedValue({ id: 3 });

    await controller.findOne(3);

    expect(servicio.findOne).toHaveBeenCalledWith(3);
  });

  it('create pasa el cuerpo al servicio', async () => {
    const dto = { nombre: 'Charmander', descripcion: 'D', tipos: [1] };

    await controller.create(dto);

    expect(servicio.create).toHaveBeenCalledWith(dto);
  });

  it('update pasa el id y los cambios al servicio', async () => {
    await controller.update(2, { descripcion: 'Nueva' });

    expect(servicio.update).toHaveBeenCalledWith(2, { descripcion: 'Nueva' });
  });

  it('remove pasa el id al servicio', async () => {
    await controller.remove(2);

    expect(servicio.remove).toHaveBeenCalledWith(2);
  });

  it('createTipo pasa el cuerpo al servicio', async () => {
    await controller.createTipo({ nombre: 'Fuego' });

    expect(servicio.createTipo).toHaveBeenCalledWith({ nombre: 'Fuego' });
  });

  it('findAllTipos devuelve la lista del servicio', async () => {
    servicio.findAllTipos.mockResolvedValue([{ id: 1, nombre: 'Fuego' }]);

    expect(await controller.findAllTipos()).toEqual([{ id: 1, nombre: 'Fuego' }]);
  });
});