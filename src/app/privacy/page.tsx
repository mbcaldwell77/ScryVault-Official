export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
            <p className="mb-4">
              ScryVault collects information you provide directly to us, such as when you create an account, 
              scan books, or connect your eBay account. This may include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (email, name)</li>
              <li>Book inventory data (ISBN, title, author, condition)</li>
              <li>eBay integration data (with your consent)</li>
              <li>Usage analytics to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our book inventory management service</li>
              <li>Process your eBay listings and sales data</li>
              <li>Send you important updates about your account</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">eBay Integration</h2>
            <p className="mb-4">
              When you connect your eBay account to ScryVault, we may access and process:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your eBay listings and inventory data</li>
              <li>Sales and transaction information</li>
              <li>Account settings and preferences</li>
            </ul>
            <p className="mt-4">
              This data is used solely to provide our book management services and is not shared with third parties 
              except as required by law or with your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction. Your data is encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at 
              privacy@scryvault.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Updates to This Policy</h2>
                          <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo; date.
              </p>
          </section>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
