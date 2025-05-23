const stateCodes = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh"
};


const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function isValidGSTIN(gstin) {
  if (!GSTIN_REGEX.test(gstin)) return false;
  const gstinChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let factor = 2;
  let sum = 0;

  for (let i = 13; i >= 0; i--) {
    const codePoint = gstinChars.indexOf(gstin[i]);
    let product = factor * codePoint;
    factor = (factor === 2) ? 1 : 2;
    product = Math.floor(product / 36) + (product % 36);
    sum += product;
  }

  const checksumChar = gstinChars[(36 - (sum % 36)) % 36];
  return gstin[14] === checksumChar;
}

export default function handler(req, res) {
  const { gstin } = req.query;
  const headers = req.headers;

  // 🔐 Auth: API Key OR Bearer Token OR RapidAPI Secret
  const authHeader = headers['authorization'];
  const apiKey = headers['x-api-key'];
  const rapidSecret = headers['x-rapidapi-proxy-secret'];

  const VALID_KEY = process.env.API_SECRET_KEY;
  const VALID_RAPID_SECRET = process.env.RAPIDAPI_SECRET;

  const isAuthorized =
    apiKey === VALID_KEY ||
    (authHeader && authHeader === `Bearer ${VALID_KEY}`) ||
    rapidSecret === VALID_RAPID_SECRET;

  if (!isAuthorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!gstin) {
    return res.status(400).json({ error: "Missing GSTIN" });
  }

  const formattedGSTIN = gstin.toUpperCase();
  const valid = isValidGSTIN(formattedGSTIN);
  const stateCode = formattedGSTIN.substring(0, 2);
  const state = stateCodes[stateCode] || "Unknown";
  const pan = formattedGSTIN.substring(2, 12);

  return res.status(200).json({
    gstin: formattedGSTIN,
    valid,
    state,
    pan,
  });
}
