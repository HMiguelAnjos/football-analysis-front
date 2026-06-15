#!/bin/sh
set -eu

# Normaliza uma URL: tira aspas, barras finais, e prefixa https:// se vier
# sem protocolo. URL vazia continua vazia (o front trata como fallback).
normalize_url() {
	url="$1"
	url="$(printf '%s' "$url" | sed "s/^['\"]//; s/['\"]$//" | sed 's#/*$##')"
	if [ -n "$url" ]; then
		case "$url" in
			http://*|https://*) ;;
			*) url="https://$url" ;;
		esac
	fi
	printf '%s' "$url"
}

# URL da API de futebol (preferida) + URL legada (single-backend) como fallback.
FOOTBALL_API_URL="$(normalize_url "${FOOTBALL_API_URL:-${vite_football_api_url:-}}")"
API_URL="$(normalize_url "${VITE_API_URL:-${vite_api_url:-http://localhost:8000}}")"

# Porta de escuta: a Railway injeta PORT e roteia pra ela. Sem PORT (docker
# local) cai em 80. O nginx precisa escutar nessa porta, senão a Railway dá 502.
PORT="${PORT:-80}"

export FOOTBALL_API_URL API_URL PORT

# nginx usa a URL legada (proxy reverso) + a porta da Railway (${PORT}).
envsubst '${API_URL} ${PORT}' < /opt/runtime/default.conf.template > /etc/nginx/conf.d/default.conf

# env.js do front: front prioriza FOOTBALL_API_URL, cai pra API_URL.
envsubst '${FOOTBALL_API_URL} ${API_URL}' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
