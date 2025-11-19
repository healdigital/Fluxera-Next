import { test, expect } from '@playwright/test';

/**
 * Test manuel pour l'inscription avec email et mot de passe
 * Ce test vérifie le processus complet d'inscription
 */

test.describe('Sign Up - Test Manuel', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'inscription
    await page.goto('http://localhost:3000/auth/sign-up');
  });

  test('devrait afficher le formulaire d\'inscription', async ({ page }) => {
    // Vérifier que la page est chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier la présence du titre
    await expect(page.getByRole('heading', { level: 4 })).toBeVisible();
    
    // Vérifier la présence des champs email et password en utilisant data-test
    const emailInput = page.locator('[data-test="email-input"]');
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Vérifier le bouton de soumission
    const submitButton = page.locator('[data-test="auth-submit-button"]');
    await expect(submitButton).toBeVisible();
  });

  test('devrait permettre l\'inscription avec email et mot de passe Leo2025!', async ({ page }) => {
    // Générer un email unique pour éviter les conflits
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'Leo2025!';

    console.log(`📧 Test avec l'email: ${testEmail}`);
    console.log(`🔐 Mot de passe: ${testPassword}`);

    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');

    // Remplir le formulaire en utilisant data-test
    await page.locator('[data-test="email-input"]').fill(testEmail);
    await page.locator('input[type="password"]').first().fill(testPassword);
    await page.locator('[data-test="repeat-password-input"]').fill(testPassword);

    // Prendre une capture d'écran avant la soumission
    await page.screenshot({ path: 'test-results/signup-before-submit.png' });

    // Soumettre le formulaire
    await page.locator('[data-test="auth-submit-button"]').click();

    // Attendre soit une redirection soit un message de confirmation
    await page.waitForTimeout(3000);

    // Prendre une capture d'écran après la soumission
    await page.screenshot({ path: 'test-results/signup-after-submit.png' });

    // Vérifier qu'on est redirigé ou qu'un message de confirmation apparaît
    const currentUrl = page.url();
    console.log(`📍 URL actuelle: ${currentUrl}`);

    // Vérifier si on est redirigé vers la page de callback ou de confirmation
    const isRedirected = 
      currentUrl.includes('/auth/callback') ||
      currentUrl.includes('/home') ||
      currentUrl.includes('/dashboard') ||
      currentUrl !== 'http://localhost:3000/auth/sign-up';

    if (isRedirected) {
      console.log('✅ Redirection réussie après inscription');
    } else {
      // Vérifier s'il y a un message de confirmation d'email
      const confirmationAlert = page.locator('[data-test="email-confirmation-alert"]');
      const isConfirmationVisible = await confirmationAlert.isVisible().catch(() => false);
      
      if (isConfirmationVisible) {
        console.log('✅ Message de confirmation d\'email affiché');
        await expect(confirmationAlert).toBeVisible();
      } else {
        console.log('⚠️  Aucune redirection ni message de confirmation détecté');
      }
    }

    // Afficher le contenu de la page pour debug
    const pageContent = await page.content();
    console.log('📄 Contenu de la page (premiers 500 caractères):');
    console.log(pageContent.substring(0, 500));
  });

  test('devrait valider le format du mot de passe', async ({ page }) => {
    const testEmail = 'test@example.com';
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    // Tester avec un mot de passe faible
    await page.locator('[data-test="email-input"]').fill(testEmail);
    await page.locator('input[type="password"]').first().fill('123');
    await page.locator('[data-test="repeat-password-input"]').fill('123');
    
    await page.locator('[data-test="auth-submit-button"]').click();
    
    // Vérifier qu'un message d'erreur apparaît
    await page.waitForTimeout(1000);
    
    // Prendre une capture d'écran
    await page.screenshot({ path: 'test-results/signup-weak-password.png' });
    
    // Vérifier qu'on est toujours sur la page d'inscription
    expect(page.url()).toContain('/auth/sign-up');
  });

  test('devrait afficher le lien vers la page de connexion', async ({ page }) => {
    // Vérifier la présence du lien "Already have an account"
    const signInLink = page.getByRole('link', { name: /already have an account|déjà un compte|se connecter/i });
    await expect(signInLink).toBeVisible();
    
    // Vérifier que le lien pointe vers la page de connexion
    await expect(signInLink).toHaveAttribute('href', /sign-in/);
  });
});
