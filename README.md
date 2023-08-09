# PlayWright

## Clonar Repositorio

Para clonar este repositorio, ejecuta el siguiente comando:

```bash
git clone https://github.com/DiamondStalker/PlayWright
```

## Carpetas

### 1. [Indeed](https://github.com/DiamondStalker/PlayWright/tree/main/Indeed)

#### Ejecución del código

Para ejecutar el código, utiliza el siguiente comando:

```bash
node index
```

#### Funcionamiento

1. El programa te preguntará si deseas crear un archivo con la lista de links en caso de no tenerlo.

    > 📝 **Nota**: La implementación se encuentra en el componente "state" y se configura desde "config.json", donde se le indicará el país.

2. Selecciona el archivo que deseas leer *(archivo tipo objeto que contiene los links)*.

3. Comenzará a recorrer los links y a tomar la información deseada expuesta en "indeed.js". Toda la información tomada pasa por el componente "file", el cual tiene acceso completo a los archivos de lectura y escritura.

4. El componente "logger" se ejecuta en todo el funcionamiento, lo que permite crear un log de todo lo que se va imprimiendo bajo el día y la hora del mensaje creado.

5. Cuando el proceso falla, se crea una notificación emergente en el computador advirtiendo que hubo un fallo en la corrida.
    > :warning: **Nota**: Esto puede ocurrir por bloqueos o tiempos de carga altos.

### 2. [ValidarEdit](https://github.com/DiamondStalker/PlayWright/tree/main/ValidarEdit)

Codigo que permite validar si dentro del cl el edit esta funcionando

### 3. [TestTemplaterF](https://github.com/DiamondStalker/PlayWright/tree/main/TestTemplaterF)

Validador de plantillas para `ATS` y otro tipo de informacion sobre codigos bases que se quieren probar antes de ser subidos a produccion.

| ⚠️ Advertencia                               | 
|:------------------------------------------:|
| Todo el código se utiliza a modo de práctica sin fines benéficos. |
