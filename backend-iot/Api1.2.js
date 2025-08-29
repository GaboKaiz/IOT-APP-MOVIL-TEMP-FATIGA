const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
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

// Modelos
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

const EsquemaTemperatura = new mongoose.Schema({
  idAuto: { type: Number, unique: true },
  fechaHora: { type: Date, default: Date.now },
  temperatura: { type: Number, required: true },
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

const EsquemaFatiga = new mongoose.Schema({
  idAuto: { type: Number, unique: true },
  idCamara: { type: String, required: true },
  ambiente: { type: String, required: true },
  idUsuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  fechaHora: { type: Date, default: Date.now },
  foto: { type: String }, // Ruta de la foto guardada
});
EsquemaFatiga.pre("save", async function (next) {
  if (!this.idAuto) {
    const ultimo = await Fatiga.findOne().sort({ idAuto: -1 });
    this.idAuto = ultimo ? ultimo.idAuto + 1 : 1;
  }
  next();
});
const Fatiga = mongoose.model("SistemaSueno", EsquemaFatiga);

// Configuración de Multer para fotos
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const subida = multer({ storage: almacenamiento });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Endpoints para Usuarios
app.post("/registro", async (req, res) => {
  const { nombreApellido, numeroCelular, correoElectronico, contrasena } =
    req.body;
  if (
    contrasena.length < 8 ||
    !/[A-Z]/.test(contrasena) ||
    !/[0-9]/.test(contrasena) ||
    !/[!@#$%^&*]/.test(contrasena)
  ) {
    return res.status(400).json({ mensaje: "Contraseña inválida" });
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

app.post("/login", async (req, res) => {
  const { correoElectronico, contrasena } = req.body;
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

app.put("/perfil/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id)
    return res.status(403).json({ mensaje: "No autorizado" });
  try {
    const usuario = await Usuario.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoints para Temperatura
app.post("/temperatura", autenticar, async (req, res) => {
  try {
    const dato = new Temperatura({ ...req.body, idUsuario: req.user.id });
    await dato.save();
    res.status(201).json(dato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/temperatura", autenticar, async (req, res) => {
  const datos = await Temperatura.find({ idUsuario: req.user.id });
  res.json(datos);
});

app.put("/temperatura/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  try {
    const dato = await Temperatura.findOneAndUpdate(
      { _id: id, idUsuario: req.user.id },
      req.body,
      { new: true }
    );
    if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
    res.json(dato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/temperatura/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  const dato = await Temperatura.findOneAndDelete({
    _id: id,
    idUsuario: req.user.id,
  });
  if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
  res.json({ mensaje: "Eliminado" });
});

// Endpoints para Fatiga
app.post("/fatiga", autenticar, subida.single("foto"), async (req, res) => {
  try {
    const dato = new Fatiga({
      ...req.body,
      idUsuario: req.user.id,
      foto: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : null,
    });
    await dato.save();
    res.status(201).json(dato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/fatiga", autenticar, async (req, res) => {
  try {
    const datos = await Fatiga.find({ idUsuario: req.user.id });
    // Ajustar la URL de la foto para incluir la URL base completa
    const datosConUrl = datos.map((dato) => ({
      ...dato._doc,
      foto: dato.foto
        ? `${req.protocol}://${req.get("host")}/${dato.foto}`
        : null,
    }));
    res.json(datosConUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/fatiga/:id", autenticar, subida.single("foto"), async (req, res) => {
  const { id } = req.params;
  try {
    const actualizacion = { ...req.body };
    if (req.file)
      actualizacion.foto = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    const dato = await Fatiga.findOneAndUpdate(
      { _id: id, idUsuario: req.user.id },
      actualizacion,
      { new: true }
    );
    if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
    res.json({
      ...dato._doc,
      foto: dato.foto
        ? `${req.protocol}://${req.get("host")}/${dato.foto}`
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/fatiga/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  try {
    const dato = await Fatiga.findOneAndDelete({
      _id: id,
      idUsuario: req.user.id,
    });
    if (!dato) return res.status(404).json({ mensaje: "No encontrado" });
    res.json({ mensaje: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
