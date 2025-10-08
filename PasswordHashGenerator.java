import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate hash for "admin123"
        String password1 = "admin123";
        String hash1 = encoder.encode(password1);
        System.out.println("Password: " + password1);
        System.out.println("Hash: " + hash1);
        System.out.println();
        
        // Generate hash for "Admin@123"
        String password2 = "Admin@123";
        String hash2 = encoder.encode(password2);
        System.out.println("Password: " + password2);
        System.out.println("Hash: " + hash2);
    }
}

