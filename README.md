# PlayWright

1. Clonar Repositorio
```bash
git clone https://github.com/DiamondStalker/PlayWright
```

## Carpetas

### 1.[Indeed](https://github.com/DiamondStalker/PlayWright/tree/main/Indeed)

#### Ejecucion del codigo
```bash
    node index
```
    
#### Funcionamiento :
1. Se preguntara si se deseaa crear un archivo con la lista de links en caso de no tener, 


> :exclamation: **Nota**: La implementacion se encuentra en el componente state y se configura desde config.json donde se le indicara el pais

2. Seleccionar el archivo se que deseea leer `Arvhivo tipo objeto que contiene los links`.
3. Se empezara a recorrer los links y a tomar la informacion deseada expuesta en indeed.js, toda informacion tomada para por el componente file,
    la cual tiene acceso completo a los archivos de lectura y de escritura.
4. El componente logger se ejecuta en todos el funcionamiento, lo que permite este es crear un log de todo lo que se va imprimiendo bajo el dia y la hora del mensaje creado
5. Cuando el mensaje falla, se crea una notificacion emergente en el computador advidiendo de que hubo un fallo en la corrida/

> :exclamation: **Nota**: Esto puede ocurrir por bloqueos o tiempos de carga altos


| ⚠️ Warning                               | 
|------------------------------------------|
| Todo el codigo se usa a modo de practica sin fines beneficos     |