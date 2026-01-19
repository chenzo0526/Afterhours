'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GetStarted() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    email: '',
    phone: '',
    challenge: '',
    callTime: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(result.message)
        // Reset form
        setFormData({
          businessName: '',
          industry: '',
          email: '',
          phone: '',
          challenge: '',
          callTime: ''
        })
      } else {
        alert(result.message || 'There was an error. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('There was an error submitting your form. Please try again.')
    }
  }

  return (
    <>
      <nav>
        <div className="container">
          <Link href="/">
            <strong>Afterhours</strong>
          </Link>
          <ul>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/start#start-trial" className="btn btn-primary">Start Live Trial</Link></li>
          </ul>
        </div>
      </nav>

      <main>
        <section style={{ paddingTop: '80px' }}>
          <div className="container">
            <div className="section-header">
              <h1>Let's Start with a Brief Conversation</h1>
              <p style={{ fontSize: '1.25rem', color: '#666666' }}>
                We may reach out by phone to understand your after-hours flow and confirm setup requirements.
              </p>
              <p style={{ fontSize: '0.95rem', color: '#666666', marginTop: '12px' }}>
                We answer after-hours and overflow calls, collect the details, and notify your on-call contact. We don&apos;t dispatch or promise arrival times.
              </p>
              <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '8px' }}>
                If this is a life-safety emergency, callers should hang up and call 911.
              </p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* What Happens Next */}
              <div style={{ marginBottom: '48px', padding: '32px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '16px' }}>What Happens Next</h3>
                <ol style={{ paddingLeft: '24px', color: '#666666' }}>
                  <li style={{ marginBottom: '12px' }}>You fill out the form below</li>
                  <li style={{ marginBottom: '12px' }}>We may reach out by phone to schedule a brief call</li>
                  <li style={{ marginBottom: '12px' }}>We confirm setup requirements and schedule a required test call</li>
                  <li style={{ marginBottom: '12px' }}>We send a trial summary based on the conversation</li>
                  <li style={{ marginBottom: '12px' }}>Go-live happens only after the test call is approved</li>
                </ol>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="businessName">Business Name *</label>
                  <input
                    type="text"
                    id="businessName"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industry *</label>
                  <select
                    id="industry"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option value="">Select an industry</option>
                    <option value="legal">Legal Services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="professional_services">Professional Services</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="local_services">Local Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Your Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="555-123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="challenge">Current Challenge (Optional)</label>
                  <textarea
                    id="challenge"
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    placeholder="What's your biggest operational challenge right now?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="callTime">Preferred Call Time (Optional)</label>
                  <select
                    id="callTime"
                    value={formData.callTime}
                    onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 Afterhours. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

