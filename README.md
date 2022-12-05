<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ecco API

1. Clonar el repositorio.

2. Tener Nest CLI instalado. 
``` 
npm install -g @nestjs/cli
``` 

3. Instalar dependencias ```yarn install```


4. Reemplazar el nombre del archivo __.env.template__ por __.env__ y colocar sus variables de entorno.

5. Levantar la base de datos.
```
docker-compose up -d
```

6. Levantar el servidor ```yarn start:dev```

7. Ejecutar SEED
```
http://localhost:3000/api/seed
```

## Stack Usado
* PostgresSQL
* Nest