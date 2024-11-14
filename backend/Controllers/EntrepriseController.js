const Entreprise = require("../Models/EntrepriseSchema");
const Subscription = require("../Models/SubscriptionSchema");
const Invoice = require("../Models/InvoiceSchema");
const Devi = require('../Models/DeviModel')
const BonCommande = require('../Models/BonCommandesModel')
const BonLivraison = require('../Models/BonLivraisonModel')
const Pack = require("../Models/PackSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cloudinary = require("../Utils/cloudinary");
const Client = require("../Models/ClientSchema")
const Fournisseur = require("../Models/FournisseurSchema");
const Enterprise = require("../Models/EntrepriseSchema");

const addEntreprise = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, phone, logo, address } = req.body;
    
    const existeEntreprise = await Entreprise.findOne({ email: email });
    if (!existeEntreprise) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await cloudinary.uploader.upload(logo, {
        folder: "Entreprises",
      });
      const entreprise = new Entreprise({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        logo: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
      await entreprise.save();
      const pack = await Pack.findOne({ name: "Pack Standard" });
      if (pack) {
        const subscription = new Subscription({
          userId: entreprise._id,
          packId: pack._id,
          startDate: Date.now(),
          endDate: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
          status: "active",
          price: 0,
        });
        await subscription.save();
        return res.status(201).json({ success: true, entreprise });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Le pack n'existe pas" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "L'entreprise existe déjà" });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'entreprise :", error);
    return res.status(500).json({
      success: false,
      message: `Erreur serveur lors de l'ajout d'entreprise : ${error}`,
      error,
    });
  }
};

const getAllEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.find({status: "active"});
    res.status(201).json(entreprises);
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la recherche d'entreprise");
  }
};

const getOneEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findById(req.params.id);
    res.status(201).json(entreprise);
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la recherche d'entreprise");
  }
};

const getEntrepriseByGoogleId = async (req, res) => {
  try {
    const entreprise = await Entreprise.findOne({ googleId: req.id });
    return entreprise;
  } catch (error) {
    console.error("Erreur serveur lors de la recherche d'entreprise");
  }
};

const getEntrepriseDetail = async (req, res) => {
  try {
    const entreprise = await Entreprise.findById(req.params.id);
    const subscriptions = await Subscription.find();
    const filteredSubscriptions = subscriptions.find(
      (subscription) =>
        subscription.userId.toString() === entreprise._id.toString()
    );
    const packEntreprise = await Pack.find();
    const filteredpackEntreprise = packEntreprise.find((pack) => {
      return (
        filteredSubscriptions &&
        filteredSubscriptions.packId.toString() === pack._id.toString()
      );
    });
    const startDate = new Date(
      filteredSubscriptions.startDate
    ).toLocaleDateString("fr-FR");
    const endDate = new Date(filteredSubscriptions.endDate).toLocaleDateString(
      "fr-FR"
    );

    const nombreClient = await Client.countDocuments({active: true, userId : entreprise._id.toString()})
    const nombreFournisseur = await Fournisseur.countDocuments({active: true, userId : entreprise._id.toString()})
    const totalInvoices = await Invoice.countDocuments({ active: true, userId : entreprise._id.toString() });
    const totalDevis = await Devi.countDocuments({ active: true , userId : entreprise._id.toString()});
    const totalBonCommandes = await BonCommande.countDocuments({ active: true, userId : entreprise._id.toString() });
    const totalBonLivraison = await BonLivraison.countDocuments({ active: true, userId : entreprise._id.toString() });
    const totalDocuments = totalInvoices + totalDevis + totalBonCommandes + totalBonLivraison;
    const entrepriseDetail = {
      _id: entreprise._id,
      name: entreprise.name,
      email: entreprise.email,
      phone: entreprise.phone,
      address: entreprise.address,
      logo: entreprise.logo,
      signature: entreprise.signature,
      subscriptionStatue: filteredSubscriptions.status,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      pack: filteredpackEntreprise.name,
      packId: filteredpackEntreprise._id,
      price: filteredpackEntreprise.price,
      nombreFournisseur: nombreFournisseur,
      nombreClient: nombreClient,
      nombreDocument: totalDocuments,
    };
    res.status(200).json(entrepriseDetail);
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("Erreur serveur lors de la recherche d'entreprise");
  }
};


const uploadSignature = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const enterprise = await Entreprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({ message: "Enterprise not found." });
    }

    if (req.file) {
      const ImgId = enterprise.signature.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "Entreprises",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });

      if (result) {
        enterprise.signature = {
          public_id: result.public_id,
          url: result.secure_url,
        };

        const updatedEnterprise = await Entreprise.findByIdAndUpdate(
          req.params.id,
          enterprise,
          {
            new: true,
          }
        );
        return res.status(200).json({
          success: true,
          enterprise: updatedEnterprise,
        });
      }
    }
  } catch (error) {
    console.error("Error uploading signature:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


const updateEntreprise = async (req, res) => {
  try {
    const currentEntreprise = await Entreprise.findById(req.params.id);
    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    };

    if (req.file) {
      const ImgId = currentEntreprise.logo.public_id;
      if (ImgId) {
        await cloudinary.uploader.destroy(ImgId);
      }

      const result = await cloudinary.uploader
        .upload_stream(
          {
            folder: "Entreprises",
          },
          async (error, result) => {
            if (error) {
              console.error(error);
              res.status(500).send({
                success: false,
                message: "Erreur serveur lors de la mise à jour d'entreprise",
                error,
              });
            } else {
              data.logo = {
                public_id: result.public_id,
                url: result.secure_url,
              };

              const entreprise = await Entreprise.findByIdAndUpdate(
                req.params.id,
                data,
                {
                  new: true,
                }
              );
              res.status(200).json({
                success: true,
                entreprise,
              });
            }
          }
        )
        .end(req.file.buffer);
    } else {
      const entreprise = await Entreprise.findByIdAndUpdate(
        req.params.id,
        data,
        {
          new: true,
        }
      );
      res.status(200).json({
        success: true,
        entreprise,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour d'entreprise",
      error,
    });
  }
};

const updateStausEntreprise = async (req, res) => {
  try {
    const enterprise = await Enterprise.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    res.status(200).json({
      success: true,
      enterprise, 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du statut de l'entreprise" });
  }
};

const removeEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndDelete(req.params.id);
    res.status(201).json(entreprise);
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la suppression d'entreprise");
  }
};

const login = async (req, res) => {
  try {
    const jsenwebtkn = req.token;
    const user = req.user;
    console.log("avant");
    
    console.log(user);
    
    //erreur :
    const sub = await Subscription.findOne({ userId: user._id });
    const pack = await Pack.findById(sub.packId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({ jsenwebtkn, user, pack });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
  console.log("sortie dans la fonction login");
};

const getDashboardInfo = async (req, res) => {
  try {
    const totalEntreprises = await Entreprise.countDocuments();
    const revenueBySubscription = await Subscription.aggregate([
      { $group: { _id: "$packId", totalRevenue: { $sum: "$price" } } },
    ]);
    const totalInvoices = await Invoice.countDocuments({ active: true });
    const totalDevis = await Devi.countDocuments({ active: true });
    const totalBonCommandes = await BonCommande.countDocuments({ active: true });
    const totalBonLivraison = await BonLivraison.countDocuments({ active: true });
    const totalDocuments = totalInvoices + totalDevis + totalBonCommandes + totalBonLivraison;
    const paidInvoices = await Invoice.countDocuments({ status: "paid", active: true });
    const unpaidInvoices = await Invoice.countDocuments({
      status: { $ne: "paid" }, active: true
    });
    const subscriptionCounts = await Subscription.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const enterpriseCountByMonthAndYear = await getEnterpriseCountByMonthAndYear(); 
    console.log(enterpriseCountByMonthAndYear)

    const dashboardData = {
      totalEntreprises,
      revenueBySubscription,
      totalDocuments,
      paidInvoices,
      unpaidInvoices,
      subscriptionCounts,
      enterpriseCountByMonthAndYear,
    };
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Erreur : ", error);
    res.status(500).json({ error: "Erreur serveur lors de la recherche d'informations du tableau de bord" });
  }
};


const getEnterpriseCountByMonthAndYear = async () => {
  try {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const enterpriseCountByMonthAndYear = await Entreprise.aggregate([
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          year: "$_id.year",
          month: { $arrayElemAt: [months, { $subtract: ["$_id.month", 1] }] },
          count: "$count",
        },
      },
    ]);
    return enterpriseCountByMonthAndYear;
  } catch (error) {
    throw new Error(error.message);
  }
};

const ForgoutPass = async (req, res) => {
  try {
    //console.log(req.body);
    const { email } = req.body;

    // Chercher l'entreprise avec l'email fourni
    const entreprise = await Entreprise.findOne({ email: email });
    if (!entreprise) {
      return res.json({ message: "Utilisateur non trouvé" });
    }

    // Créer un token JWT
    const token = jwt.sign({ id: entreprise._id }, "AbdelilahElgallati1230", {
      expiresIn: "1d",
    });

    // Configurer le transporteur de nodemailer
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "myinvoice06@gmail.com",
        pass: "ekiv afoc wbnb mrep", // Assurez-vous de stocker le mot de passe en toute sécurité
      },
    });

    // Contenu HTML de l'email avec du style
    const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #333;">Réinitialisation du mot de passe</h2>
              <p>Bonjour,</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
              <a 
                  href="http://localhost:3000/reset-password/${entreprise._id}/${token}" 
                  style="display: inline-block; padding: 10px 20px; margin: 10px 0; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;"
              >
                  Réinitialiser le mot de passe
              </a>
              <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
              <p>Merci,</p>
              <p>L'équipe MyInvoice</p>
          </div>
      `;

    // Définir les options de l'email
    var mailOptions = {
      from: "myinvoice06@gmail.com",
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: htmlContent,
    };

    // Envoyer l'email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Erreur lors de l'envoi de l'email:", error.message);
        res.status(500).json({ message: "Échec de l'envoi de l'email" });
      } else {
        res
          .status(200)
          .json({
            message: "Email envoyé avec succès ! Vérifiez votre email.",
          });
      }
    });
  } catch (error) {
    console.error("Erreur dans ForgotPass:", error.message);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

const ResetPass = async (req, res) => {
  console.log(req.body);
  const id = req.body.id;
  const token = req.body.token;
  const password = req.body.password;
  console.log(password);
  jwt.verify(token, "AbdelilahElgallati1230", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          Entreprise.findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => res.send({ Status: "Success" }))
            .catch((err) => res.send({ Status: err }));
        })
        .catch((err) => res.send({ Status: err }));
    }
  });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Entreprise.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardInfo,
  addEntreprise,
  getAllEntreprises,
  getOneEntreprise,
  updateEntreprise,
  removeEntreprise,
  login,
  getEnterpriseCountByMonthAndYear,
  getEntrepriseDetail,
  getEntrepriseByGoogleId,
  ForgoutPass,
  ResetPass,
  changePassword,
  uploadSignature,
  updateStausEntreprise,
};
