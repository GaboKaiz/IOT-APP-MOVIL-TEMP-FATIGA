const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:19006",
      "https://api-node-js-iot-app-movil.onrender.com",
      "https://wokwi.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error en conexión:", err));

// Middleware de autenticación
const autenticar = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ mensaje: "No autorizado" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

// Esquema de Usuario
const EsquemaUsuario = new mongoose.Schema({
  idAuto: { type: Number, unique: true },
  nombreApellido: { type: String, required: true },
  numeroCelular: { type: String, required: true },
  correoElectronico: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
});
EsquemaUsuario.pre("save", async function (next) {
  if (!this.idAuto) {
    const ultimo = await Usuario.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo ? ultimo.idAuto + 1 : 1;
  }
  if (this.isModified("contrasena")) {
    this.contrasena = await bcrypt.hash(this.contrasena, 10);
  }
  next();
});
const Usuario = mongoose.model("Usuario", EsquemaUsuario);

// Esquema de Temperatura
const EsquemaTemperatura = new mongoose.Schema({
  idAuto: { type: Number, unique: true },
  fechaHora: { type: Date, default: Date.now },
  temperatura: { type: Number },
  ambiente: { type: String, required: true },
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  conectadoVentilador: { type: Boolean, default: false },
  idDispositivo: { type: String, required: true },
});
EsquemaTemperatura.pre("save", async function (next) {
  if (!this.idAuto) {
    const ultimo = await Temperatura.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo ? ultimo.idAuto + 1 : 1;
  }
  next();
});
const Temperatura = mongoose.model("SistemaTemperatura", EsquemaTemperatura);

// Esquema de Fatiga
const EsquemaFatiga = new mongoose.Schema({
  idAuto: { type: Number, unique: true },
  idCamara: { type: String, required: true },
  ambiente: { type: String, required: true },
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  fechaHora: { type: Date, default: Date.now },
  foto: { type: String, required: true },
  cloudinaryPublicId: { type: String }, // Para almacenar el ID público de Cloudinary
});
EsquemaFatiga.pre("save", async function (next) {
  if (!this.idAuto) {
    const ultimo = await Fatiga.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo ? ultimo.idAuto + 1 : 1;
  }
  next();
});
const Fatiga = mongoose.model("SistemaSueno", EsquemaFatiga);

// Configuración de multer con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "IoT_Fatiga",
    allowed_formats: ["jpg", "png"],
    public_id: (req, file) => `fatiga_${Date.now()}_${file.originalname}`,
  },
});
const subida = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpg, png)"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Endpoint de registro
app.post("/registro", async (req, res) => {
  const { nombreApellido, numeroCelular, correoElectronico, contrasena } =
    req.body;
  if (
    !contrasena ||
    contrasena.length < 8 ||
    !/[A-Z]/.test(contrasena) ||
    !/[0-9]/.test(contrasena) ||
    !/[@%_=+.]/.test(contrasena)
  ) {
    return res.status(400).json({ mensaje: "Contraseña inválida" });
  }
  if (!correoElectronico || !correoElectronico.endsWith("@cistcor.com")) {
    return res
      .status(400)
      .json({ mensaje: "El correo debe terminar en @cistcor.com" });
  }
  try {
    const usuario = new Usuario({
      nombreApellido,
      numeroCelular,
      correoElectronico,
      contrasena,
    });
    await usuario.save();
    res.status(201).json({ mensaje: "Usuario registrado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de login
app.post("/login", async (req, res) => {
  const { correoElectronico, contrasena } = req.body;
  if (!correoElectronico || !contrasena) {
    return res
      .status(400)
      .json({ mensaje: "Correo y contraseña son requeridos" });
  }
  const usuario = await Usuario.findOne({ correoElectronico });
  if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
    return res.status(401).json({ mensaje: "Credenciales inválidas" });
  }
  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  const usuarioSinContrasena = { ...usuario._doc };
  delete usuarioSinContrasena.contrasena;
  res.json({ token, usuario: usuarioSinContrasena });
});

// Endpoint de actualización de perfil
app.put("/perfil/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  const { nombreApellido, numeroCelular, correoElectronico, contrasena } =
    req.body;
  if (!nombreApellido || !numeroCelular || !correoElectronico) {
    return res
      .status(400)
      .json({ mensaje: "Nombre, número de celular y correo son obligatorios" });
  }
  if (!correoElectronico.endsWith("@cistcor.com")) {
    return res
      .status(400)
      .json({ mensaje: "El correo debe terminar en @cistcor.com" });
  }
  if (
    contrasena &&
    (contrasena.length < 8 ||
      !/[A-Z]/.test(contrasena) ||
      !/[0-9]/.test(contrasena) ||
      !/[@%_=+.]/.test(contrasena))
  ) {
    return res.status(400).json({
      mensaje:
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial (@%_=+.)",
    });
  }
  try {
    const updateData = { nombreApellido, numeroCelular, correoElectronico };
    if (contrasena) {
      updateData.contrasena = contrasena;
    }
    const usuario = await Usuario.findOneAndUpdate(
      { _id: id, _id: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    const usuarioSinContrasena = { ...usuario._doc };
    delete usuarioSinContrasena.contrasena;
    res.json(usuarioSinContrasena);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ mensaje: "El correo ya está en uso" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de temperatura (POST)
app.post("/temperatura", autenticar, async (req, res) => {
  const { ambiente, idDispositivo, temperatura } = req.body;
  if (!ambiente || !idDispositivo) {
    return res.status(400).json({
      mensaje: "Ambiente e ID de dispositivo son requeridos",
    });
  }
  try {
    const dato = new Temperatura({
      temperatura,
      ambiente,
      idDispositivo,
      idUsuario: req.user.id,
      conectadoVentilador: temperatura > 30,
    });
    await dato.save();
    res.status(201).json(dato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de temperatura (GET todos, con paginación)
app.get("/temperatura", autenticar, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const datos = await Temperatura.find({ idUsuario: req.user.id })
      .sort({ fechaHora: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Temperatura.countDocuments({ idUsuario: req.user.id });
    res.json({ datos, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de temperatura (GET por deviceId)
app.get("/temperatura/device/:deviceId", autenticar, async (req, res) => {
  const { deviceId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    const datos = await Temperatura.find({
      idDispositivo: deviceId,
      idUsuario: req.user.id,
    })
      .sort({ fechaHora: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Temperatura.countDocuments({
      idDispositivo: deviceId,
      idUsuario: req.user.id,
    });
    res.json({ datos, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de temperatura (GET por ID)
app.get("/temperatura/:id", autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    const dato = await Temperatura.findOne({ _id: id, idUsuario: req.user.id });
    if (!dato) {
      return res.status(404).json({ mensaje: "Dispositivo no encontrado" });
    }
    res.json(dato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de temperatura (DELETE)
app.delete("/temperatura/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  try {
    const dato = await Temperatura.findOneAndDelete({
      _id: id,
      idUsuario: req.user.id,
    });
    if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
    res.json({ mensaje: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de fatiga (POST)
app.post("/fatiga", autenticar, subida.single("foto"), async (req, res) => {
  const { idCamara, ambiente } = req.body;
  if (!idCamara || !ambiente || !req.file) {
    return res
      .status(400)
      .json({ mensaje: "ID de cámara, ambiente y foto son requeridos" });
  }
  try {
    const dato = new Fatiga({
      idCamara,
      ambiente,
      idUsuario: req.user.id,
      foto: req.file.path, // URL pública de Cloudinary
      cloudinaryPublicId: req.file.filename, // Public ID para eliminación
    });
    await dato.save();
    console.log("Imagen subida a Cloudinary:", req.file.path);
    res.status(201).json(dato);
  } catch (err) {
    console.error("Error al guardar fatiga:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de fatiga (GET)
app.get("/fatiga", autenticar, async (req, res) => {
  try {
    const datos = await Fatiga.find({ idUsuario: req.user.id }).sort({
      fechaHora: -1,
    });
    console.log("Datos de fatiga enviados:", JSON.stringify(datos, null, 2));
    res.json(datos);
  } catch (err) {
    console.error("Error al obtener fatiga:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de fatiga (DELETE)
app.delete("/fatiga/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  try {
    const dato = await Fatiga.findOneAndDelete({
      _id: id,
      idUsuario: req.user.id,
    });
    if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
    if (dato.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(dato.cloudinaryPublicId);
        console.log(
          `Imagen eliminada de Cloudinary: ${dato.cloudinaryPublicId}`
        );
      } catch (err) {
        console.error("Error al eliminar imagen de Cloudinary:", err.message);
      }
    }
    res.json({ mensaje: "Eliminado" });
  } catch (err) {
    console.error("Error al eliminar fatiga:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint opcional por idDispositivo (GET)
app.get(
  "/temperatura/idDispositivo/:idDispositivo",
  autenticar,
  async (req, res) => {
    try {
      const { idDispositivo } = req.params;
      const dato = await Temperatura.findOne({
        idDispositivo,
        idUsuario: req.user.id,
      });
      if (!dato) {
        return res.status(404).json({ mensaje: "Dispositivo no encontrado" });
      }
      res.json(dato);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err.stack);
  if (err.message.includes("Solo se permiten imágenes")) {
    return res.status(400).json({ mensaje: err.message });
  }
  res
    .status(500)
    .json({ error: "Error interno del servidor", details: err.message });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
