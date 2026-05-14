import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 1. SIGNUP FUNCTION
export const signupUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
        await db.query(sql, [name, email, hashedPassword]);
        return res.status(201).json({ status: "Success", message: "User registered!" });
    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        return res.status(500).json({ error: "Signup failed" });
    }
};

// 2. LOGIN FUNCTION
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const { password: _, ...userData } = user;
                const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
                return res.status(200).json({ status: "Success", token, user: userData });
            } else {
                return res.status(401).json({ message: "Invalid password!" });
            }
        } else {
            return res.status(404).json({ message: "User not found!" });
        }
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ error: "Login error" });
    }
};

// 3. PROFILE UPDATE LOGIC (Handling Resume Upload)
export const updateFullProfile = async (req, res) => {
    // Multer moolama file vandha 'req.file' kulla filename irukum
    const resume_url = req.file ? req.file.filename : null;
    const { userId, phone, location, role, summary, name, street_address, pincode } = req.body;
    
    // Frontend-la irundhu vara ID
    const id = userId || req.params.id;

    if (!id) return res.status(400).json({ error: "User ID missing!" });

    try {
        // A. Login table-la name update panrom
        if (name) {
            await db.query("UPDATE login SET name = ? WHERE id = ?", [name, id]);
        }

        // B. user_profiles table-la details insert/update panrom
        // resume_url update aagum pothu IFNULL use panrom, so existing file delete aagathu
        const sql = `
            INSERT INTO user_profiles (userId, phone, location, role, summary, street_address, pincode, resume_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            phone = VALUES(phone), 
            location = VALUES(location), 
            role = VALUES(role), 
            summary = VALUES(summary),
            street_address = VALUES(street_address),
            pincode = VALUES(pincode),
            resume_url = IFNULL(VALUES(resume_url), resume_url)`;

        await db.query(sql, [id, phone, location, role, summary, street_address, pincode, resume_url]);
        
        res.status(200).json({ 
            status: "Success", 
            message: "Profile updated successfully! ✅", 
            file: resume_url 
        });
    } catch (error) {
        console.error("DB UPDATE ERROR:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 4. GET FULL PROFILE LOGIC
export const getFullProfile = async (req, res) => {
    const userId = req.params.id;
    
    const sql = `
        SELECT u.name, u.email, p.phone, p.location, p.role, p.summary, p.street_address, p.pincode, p.resume_url
        FROM login u 
        LEFT JOIN user_profiles p ON u.id = p.userId 
        WHERE u.id = ?`;

    try {
        const [rows] = await db.query(sql, [userId]);
        
        if (rows.length > 0) {
            const data = rows[0];
            
            // UI-la 'null' nu varaama irukka empty string handling
            const sanitizedData = {
                name: data.name || "User",
                email: data.email || "",
                phone: data.phone || "",
                location: data.location || "",
                role: data.role || "Web Developer",
                summary: data.summary || "",
                street_address: data.street_address || "",
                pincode: data.pincode || "",
                resume_url: data.resume_url || ""
            };

            res.status(200).json(sanitizedData);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("FETCH PROFILE ERROR:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// 5. SPECIFIC SUMMARY UPDATE
export const updateSummary = async (req, res) => {
    const { userId, summary } = req.body;
    const sql = "UPDATE user_profiles SET summary = ? WHERE userId = ?";
    
    try {
        await db.query(sql, [summary, userId]);
        res.status(200).json({ message: "Summary updated in Database! ✅" });
    } catch (error) {
        console.error("DB ERROR:", error);
        res.status(500).json({ error: "Database update failed" });
    }
};
