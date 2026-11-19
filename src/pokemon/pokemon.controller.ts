import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PokemonService } from './pokemon.service.js';
import { CreatePokemonDto } from './dto/create-pokemon.dto.js';
import { UpdatePokemonDto } from './dto/update-pokemon.dto.js';
import { CreateTipoDto } from './dto/create-tipo.dto.js';
import { UpdateTipoDto } from './dto/update-tipo.dto.js';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Post('tipo')
  createTipo(@Body() createTipoDto: CreateTipoDto) {
    return this.pokemonService.createTipo(createTipoDto);
  }
    @Get('tipo')
  findAllTipos() {
    return this.pokemonService.findAllTipos();
  }

  @Get('tipo/:id')
  findOneTipo(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.findOneTipo(id);
  }

  @Patch('tipo/:id')
  updateTipo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoDto: UpdateTipoDto,
  ) {
    return this.pokemonService.updateTipo(id, updateTipoDto);
  }

  @Delete('tipo/:id')
  removeTipo(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.removeTipo(id);
  }
  @Get()
  findAll() {
    return this.pokemonService.findAll();
  }

    @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePokemonDto: UpdatePokemonDto,
  ) {
    return this.pokemonService.update(id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.remove(id);
  }
}
