import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto.js';
import { UpdatePokemonDto } from './dto/update-pokemon.dto.js';
import { CreateTipoDto } from './dto/create-tipo.dto.js';
import { UpdateTipoDto } from './dto/update-tipo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity.js';
import { Tipo } from './entities/tipos.entity.js';


@Injectable()
export class PokemonService {
  //Crea el cronstructor para Injectar los repositorios
  constructor(
    // Injecta el repositorio y lo disponibiliza como una constante privada
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>,
    @InjectRepository(Tipo)
    private tipoRepository: Repository<Tipo>,
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    const { tipos: tipoIds, ...datos } = createPokemonDto;

    // Busca los tipos indicados; si falta alguno no se crea el pokemon
    const tipos = await this.tipoRepository.findBy({ id: In(tipoIds) });
    
    if (tipos.length !== tipoIds.length) {
      const encontrados = tipos.map((tipo) => tipo.id);
      const faltantes = tipoIds.filter((id) => !encontrados.includes(id));
      throw new BadRequestException(
        `No existen los tipos con id: ${faltantes.join(', ')}`,
      );
    }

    const pokemon = this.pokemonRepository.create({ ...datos, types: tipos });
    return this.pokemonRepository.save(pokemon);
  }

  createTipo(createTipoDto: CreateTipoDto) {
    return this.tipoRepository.save(createTipoDto);
  }
    findAllTipos() {
    return this.tipoRepository.find();
  }

  async findOneTipo(id: number) {
    const tipo = await this.tipoRepository.findOneBy({ id });
    if (!tipo) {
      throw new NotFoundException(`No existe el tipo con id ${id}`);
    }
    return tipo;
  }

  async updateTipo(id: number, updateTipoDto: UpdateTipoDto) {
    const tipo = await this.findOneTipo(id);
    Object.assign(tipo, updateTipoDto);
    return this.tipoRepository.save(tipo);
  }

  async removeTipo(id: number) {
    const tipo = await this.tipoRepository.findOne({
      where: { id },
      relations: { pokemons: true },
    });
    if (!tipo) {
      throw new NotFoundException(`No existe el tipo con id ${id}`);
    }
    // Un pokemon debe tener al menos un tipo, así que no se borra un tipo en uso
    if (tipo.pokemons.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo "${tipo.nombre}": lo usan ${tipo.pokemons.length} pokemon`,
      );
    }
    await this.tipoRepository.remove(tipo);
    return { mensaje: `Tipo con id ${id} eliminado` };
  }
  
  findAll() {
    return this.pokemonRepository.find({ relations: { types: true } });
  }

  async findOne(id: number) {
    const pokemon = await this.pokemonRepository.findOne({
      where: { id },
      relations: { types: true },
    });
    if (!pokemon) {
      throw new NotFoundException(`No existe el pokemon con id ${id}`);
    }
    return pokemon;
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    // Si el pokemon no existe, findOne lanza el error 404
    const pokemon = await this.findOne(id);
    const { tipos: tipoIds, ...datos } = updatePokemonDto;

    // Solo cambia los tipos si vienen en la petición
    if (tipoIds) {
      const tipos = await this.tipoRepository.findBy({ id: In(tipoIds) });

      if (tipos.length !== tipoIds.length) {
        const encontrados = tipos.map((tipo) => tipo.id);
        const faltantes = tipoIds.filter((id) => !encontrados.includes(id));
        throw new BadRequestException(
          `No existen los tipos con id: ${faltantes.join(', ')}`,
        );
      }
      pokemon.types = tipos;
    }

    // Copia solo los campos enviados (nombre y/o descripcion)
    Object.assign(pokemon, datos);
    return this.pokemonRepository.save(pokemon);
  }

  async remove(id: number) {
    // Si no existe, lanza el error 404
    const pokemon = await this.findOne(id);
    await this.pokemonRepository.remove(pokemon);
    return { mensaje: `Pokemon con id ${id} eliminado` };
  }
}
