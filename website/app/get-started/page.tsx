'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
    <section className="pt-24 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Let&apos;s Start with a Brief Conversation
          </h1>
          <p className="text-lg text-muted-foreground">
            We may reach out by phone to understand your off-hours flow and confirm setup requirements.
          </p>
          <p className="text-base text-muted-foreground">
            We answer calls when your office is closed and overflow calls, collect the details, and notify your on-call contact. We don&apos;t dispatch or promise arrival times.
          </p>
          <p className="text-sm text-muted-foreground">
            If this is a life-safety emergency, callers should hang up and call 911.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="mb-12 rounded-xl border border-border bg-card/70 p-8">
            <h2 className="mb-6 text-xl font-semibold text-foreground">What Happens Next</h2>
            <ol className="list-inside list-decimal space-y-3 pl-2 text-muted-foreground">
              <li>You fill out the form below</li>
              <li>We may reach out by phone to schedule a brief call</li>
              <li>We confirm setup requirements and schedule a quick setup check to confirm forwarding works</li>
              <li>We send a trial summary based on the conversation</li>
              <li>Live trial begins</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Get started form" className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-foreground">
                Business Name <span aria-label="required">*</span>
              </label>
              <Input
                type="text"
                id="businessName"
                name="businessName"
                required
                aria-required="true"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="block text-sm font-medium text-foreground">
                Industry <span aria-label="required">*</span>
              </label>
              <Select
                id="industry"
                name="industry"
                required
                aria-required="true"
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
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Your Email <span aria-label="required">*</span>
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                aria-required="true"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Your Phone <span aria-label="required">*</span>
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                required
                aria-required="true"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-123-4567"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="challenge" className="block text-sm font-medium text-foreground">
                Current Challenge (Optional)
              </label>
              <Textarea
                id="challenge"
                name="challenge"
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                placeholder="What's your biggest operational challenge right now?"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="callTime" className="block text-sm font-medium text-foreground">
                Preferred Call Time (Optional)
              </label>
              <Select
                id="callTime"
                name="callTime"
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
              >
                <option value="">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </Select>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
