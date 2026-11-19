import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pokemon } from './pokemon.entity.js';

@Entity('tipo')
export class Tipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @ManyToMany(() => Pokemon, (pokemon) => pokemon.types)
  pokemons: Pokemon[];
}