const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

console.log(databaseUrl);

// Configuración de Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Cambia esto a true en producción
    }
  }
});

// Definición de modelos

const Persona = sequelize.define('Persona', {
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  CUIL: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  DNI: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Usuario = sequelize.define('Usuario', {
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  nombre_Certificado: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Administrador = sequelize.define('Administrador', {
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  CUIL: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Peticiones = sequelize.define('Peticiones', {
  usuarioId: { 
    type: DataTypes.CHAR,
    allowNull: false,
  },
  AutorId: { 
    type: DataTypes.CHAR,
    allowNull: false,
  },
  nombre_Certificado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  peticion: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const CSR = sequelize.define('CSR', {
  usuarioId: { 
    type: DataTypes.CHAR,
    allowNull: false,
  },
  contraseña: { 
    type: DataTypes.CHAR,
    allowNull: false,
  },
  datos: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estado: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
}, {
  timestamps: false,
});

const CertificateRoot = sequelize.define('Certificados_Raiz', {
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  firmante: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  privateKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  IssuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

const CertificateEmitidos = sequelize.define('Certificados_Emitidos', {
  Id_Root: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  Id_Certificado: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  IssuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Repositorio = sequelize.define('Repositorio', {
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  OCSP: {
    type: DataTypes.TEXT,
    defaultValue: false,
  },
}, {
  timestamps: false,
});

// Definir las asociaciones

Usuario.belongsTo(Persona, { foreignKey: 'Id', targetKey: 'Id' });
Administrador.belongsTo(Persona, { foreignKey: 'Id', targetKey: 'Id' });

Usuario.hasMany(Peticiones, { foreignKey: 'usuarioId' });
Peticiones.belongsTo(Usuario, { foreignKey: 'usuarioId', targetKey: 'Id', as: 'usuarioAsociado' });

CSR.belongsTo(Usuario, { foreignKey: 'usuarioId', targetKey: 'Id', as: 'usuarioAsociado' });

CertificateRoot.belongsTo(Peticiones, {
  foreignKey: 'Id',
  targetKey: 'usuarioId',
});

CertificateRoot.hasMany(CertificateEmitidos, { foreignKey: 'Id_Root' });
CertificateEmitidos.belongsTo(CertificateRoot, { foreignKey: 'Id_Root', targetKey: 'Id', as: 'raizAsociada' });

Repositorio.belongsTo(CertificateRoot, { foreignKey: 'Id', targetKey: 'Id' });

// Intentar conectar y sincronizar

const connectAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sincronizar modelos
    await sequelize.sync({ force: true });
    console.log('Models synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Salir si ocurre otro error
  }
};

connectAndSync();

// Exportar modelos
module.exports = { sequelize, Persona, Usuario, Administrador, Peticiones, CSR, CertificateRoot, CertificateEmitidos, Repositorio };