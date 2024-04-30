#!/usr/bin/env -S node
import { spawn } from 'node:child_process';
import { readFile, rm, writeFile, } from 'node:fs/promises';
import { extname, parse } from 'node:path';
import { TscWatchClient } from 'tsc-watch/client.js';

const watch = new TscWatchClient();
watch.on( 'started', async () => {} );
watch.on( 'success', () => {} );

watch.on( 'file_emitted', async ( filename ) => {

  const is_declaration = extname( parse( filename ).name ) !== '.d';

  if ( is_declaration ) {

    const babel = spawn( 'npx', [
      'babel',
      filename,
      '--out-dir',
      './',
      '--relative',
      '--out-file-extension',
      '.js',
    ] );

    babel.stdout.on( 'data', ( data ) => {
      process.stdout.write( data );
    } );

    babel.stderr.on( 'data', ( data ) => {
      process.stderr.write( data );
    } );

    babel.on( 'error', ( error ) => {
      console.log( error );
    } );

    babel.on( 'exit', async () => {

      if( extname( filename ) === '.jsx' ){
        await rm( filename );
      }
      const is_destination = `${parse( filename ).dir}/${parse( filename ).name}.js`;
      await readFile( is_destination, { encoding: 'utf-8' } ).then( async ( data ) => {
        await writeFile( is_destination, data.replaceAll( '<>', 'Fragment(' ).replaceAll( '</>', ')' ) );
      } );
    } );
  }
} );

watch.start( '--signalEmittedFiles' );
