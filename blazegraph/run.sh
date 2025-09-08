#!/bin/bash

if [[ "$1" == "--clean" ]]; then
  rm -f blazegraph.jnl
fi

if [ ! -e "blazegraph.jnl" ]; then
  gzip -d -c empty-blazegraph.jnl.gz > blazegraph.jnl
  chmod ga+w blazegraph.jnl
fi

docker compose up
