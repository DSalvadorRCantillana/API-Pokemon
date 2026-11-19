import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service.js';
import { PokemonController } from './pokemon.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from './entities/pokemon.entity.js';
import { Tipo } from './entities/tipos.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Pokemon, Tipo])],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}
