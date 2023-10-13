# Indeed

## Ejecucion del codigo

```bash
node index
```

## Funcionamiento

1. El programa preguntara si deseas crear un archivo con la lista de liks
> 📝 Nota: La implementacion se encuentra en el componente `state` y se configura desde `config.json` donde se le indicara el pais a tomar los links

2. Seleccionar el archivo que se desea leer para la ejecucion `archivo tipo objeto que contiene los links`.

3. Comenzará a recorrer los links y a tomar la información deseada expuesta en "indeed.js". Toda la información tomada pasa por el componente "file", el cual tiene acceso completo a los archivos de lectura y escritura.

4. El componente `logger` se ejecuta en todo el funcionamiento, lo que permite crear un log de todo lo que se va imprimiendo bajo el día y la hora del mensaje creado.

5. Cuando el proceso falla, se crea una notificación emergente en el computador advirtiendo que hubo un fallo en la corrida.
   > 📝 Nota: Esto puede ocurrir por bloqueos o tiempos de carga altos

|⚠️ Advertencia|
|---|
|Todo el código se utiliza a modo de práctica sin fines benéficos.|