Arquitectura y Diseño Orientado a Objetos: Mercado Mutualista Online
1. Visión y Alcance del Proyecto
El "Mercado Mutualista Online" es una plataforma B2C diseñada para digitalizar y centralizar el catálogo de mercadería del sector gremial. La solución permite a los comerciantes competir tecnológicamente contra las grandes cadenas de supermercados, abstrayendo la complejidad transaccional mediante una redirección estratégica hacia canales de comunicación asíncronos (WhatsApp) para la finalización de ventas.
El presente repositorio no es únicamente una implementación de código funcional, sino una demostración práctica de Ingeniería de Software. Aplica rigurosamente Análisis y Diseño Orientado a Objetos (OOA/D), Arquitectura en Capas y patrones GRASP (General Responsibility Assignment Software Patterns) para garantizar un sistema altamente cohesivo, de bajo acoplamiento y libre de deuda técnica.
2. Arquitectura de Datos: Independencia Lógico/Física y Agnosticismo Tecnológico
El diseño del sistema cumple con el principio de independencia lógica y física de los datos, aislando las reglas del negocio de la infraestructura subyacente.

    Modelo Conceptual (Agnosticismo en la Nube): Las entidades del dominio (como Producto.java y Categoria.java) son Plain Old Java Objects (POJOs). Se ha garantizado que el modelo conceptual no posea ningún acoplamiento hacia proveedores de infraestructura específicos (AWS, Azure o Huawei Cloud). La persistencia y el almacenamiento se inyectan mediante polimorfismo, cumpliendo con el Principio de Inversión de Dependencias.
    Variaciones Protegidas (Protected Variations) en la Taxonomía: Para soportar la escalabilidad del catálogo maestro sin alterar el esquema relacional, la entidad Categoria.java implementa una relación reflexiva (uno a muchos mapeada a sí misma). Esto permite soportar N niveles de profundidad jerárquica protegiendo a la base de datos de rediseños futuros.

3. Asignación de Responsabilidades (Patrones GRASP de Craig Larman)
El sistema rechaza el anti-patrón de "Modelo de Dominio Anémico" mediante la centralización del comportamiento en los objetos que poseen los datos, aplicando los principios de Craig Larman:

    Information Expert: Entidades como Producto.java actúan como "Expertos de Información". La clase posee el conocimiento completo de sus atributos comerciales y es la única responsable de validar sus propias reglas de negocio (invariantes del dominio, como validaciones de precio) antes de permitir mutaciones de estado.
    Creator: Siguiendo el patrón Creador, las entidades del dominio instancian sus agregados lógicos. La clase Producto es la responsable de crear y administrar internamente la colección de sus objetos Multimedia, manteniendo la encapsulación y la cohesión de estado.
    Pure Fabrication e Indirection: Los Servicios de Aplicación (ej. GestionarProductoService.java) operan como "Fabricaciones Puras". Orquestan la transacción entre la base de datos relacional y el almacenamiento físico (Storage) sin asumir reglas del dominio. Para el almacenamiento, utilizan una capa de Indirección a través de la interfaz StorageService.java, cuya implementación concreta (ej. LocalFileSystemStorageAdapter.java) es inyectada.
    Controller: Los controladores de la API REST actúan estrictamente como fachadas delegadoras (Controladores de Casos de Uso), interceptando peticiones HTTP y derivando la ejecución a la capa de aplicación, garantizando cero lógica de negocio en la capa de exposición.

4. Separación Modelo-Vista (Model-View Separation)
El frontend, desarrollado en React 19 y TypeScript, respeta de manera intransigente el principio de Model-View Separation.
El backend expone las categorías del catálogo a través de DTOs planos. La responsabilidad de transformar estos datos en un árbol jerárquico navegable en memoria recae exclusivamente en la capa de presentación del cliente (mediante funciones de fabricación pura como buildCategoryTree en CatalogoPage.tsx). Esta decisión arquitectónica protege al Modelo de Dominio de cualquier variación gráfica solicitada por el usuario (Protected Variations) y distribuye la carga de procesamiento visual hacia el nodo cliente.
5. Gestión Transaccional y Compensación (ACID)
Para asegurar el cumplimiento de las propiedades ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad), el sistema gestiona transacciones distribuidas entre la base de datos y el sistema de archivos:

    Orquestación de Compensación: Si la transacción relacional falla (rollback de JPA), el servicio de aplicación detecta los recursos multimedia creados en el storage y ejecuta una estrategia de compensación explícita (invocando a storageService.borrarArchivo()). Esto garantiza la consistencia eventual y evita la acumulación de archivos huérfanos, demostrando robustez empresarial en el manejo de fallos.

6. Stack Tecnológico

    Backend: Java 21, Spring Boot 3.5, Spring Data JPA, H2 Database (entorno local).
    Frontend: React 19, TypeScript, Tailwind CSS, Vite.
    Diseño: Clean Architecture, GRASP, Model-View Separation, Patrones GoF (Adapter, Factory, Singleton).

7. Instrucciones de Despliegue Local
Backend:

# Otorgar permisos de ejecución a Gradle
chmod +x gradlew

# Iniciar la aplicación y poblar los datos maestros en memoria (DataSeeder)
./gradlew bootRun --args='--spring.profiles.active=default'

Frontend:

cd portal-cliente
npm install
npm run dev
