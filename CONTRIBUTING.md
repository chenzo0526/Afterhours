# Contributing to Afterhours

This guide explains how to set up the development environment, run tests, and contribute to the project.

## Development Setup

### Prerequisites

- Python 3.8+ (for voice agent and lead engine)
- Node.js 18+ and npm (for website)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "afterhours night agent"
   ```

2. **Set up Python environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   cd voice_agent
   pip install -r requirements.txt
   cd ../lead_engine
   pip install -r requirements.txt
   ```

3. **Set up website**
   ```bash
   cd website
   npm install
   ```

## Running Tests

### Voice Agent Tests

```bash
cd voice_agent
python -m pytest tests/
# Or
python -m unittest discover tests
```

### Lead Engine Tests

```bash
cd lead_engine
python -m pytest tests/  # If tests exist
```

## Running Locally

### Voice Agent

```bash
cd voice_agent
python main.py  # Run example simulation
```

### Lead Engine

```bash
cd lead_engine
# Process CSV file
python -m lead_engine.cli process input.csv --output output.csv

# Or run example
python main.py
```

### Website

```bash
cd website
npm run dev
# Visit http://localhost:3000
```

## Adding New Features

### Adding a New Voice Agent Flow

1. Create new flow class in `voice_agent/call_flows.py`:
   ```python
   class NewFlow(CallFlow):
       def _define_states(self):
           # Define states
           pass
   ```

2. Register in `get_flow_for_call_type()` function

3. Add tests in `voice_agent/tests/test_call_flows.py`

### Adding a New Lead Source

1. Add loader method to `lead_engine/lead_sources.py`:
   ```python
   def load_from_new_source(self, ...):
       # Load leads
       return self.processor.load_from_dict_list(data, source)
   ```

2. Update CLI in `lead_engine/cli.py` if needed

### Adding Website Pages

1. Create new page in `website/app/[page-name]/page.tsx`
2. Add to navigation in `website/app/layout.tsx` or individual pages
3. Update styles in `website/app/globals.css` if needed

## Code Style

### Python

- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings to functions and classes
- Keep functions focused and small

### TypeScript/React

- Use TypeScript for type safety
- Follow React best practices
- Use functional components and hooks
- Keep components small and focused

## Testing Guidelines

- Write tests for new features
- Aim for >80% code coverage
- Test edge cases and error conditions
- Update tests when modifying existing code

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Update documentation if needed
5. Ensure all tests pass
6. Submit pull request with clear description

## Project Structure

```
afterhours night agent/
├── voice_agent/          # Voice agent system
│   ├── call_flows.py     # Conversation flows
│   ├── intent_detector.py # Intent detection
│   ├── state_machine.py   # State management
│   ├── async_support.py   # Async wrappers
│   └── tests/            # Unit tests
├── lead_engine/          # Lead processing
│   ├── lead_processor.py  # Lead normalization
│   ├── decision_maker_detector.py # Decision-maker detection
│   ├── queue_manager.py  # Email queue
│   ├── lead_ranker.py    # Lead ranking
│   ├── lead_segmenter.py # Segmentation
│   └── cli.py            # Command-line interface
├── website/              # Next.js website
│   └── app/              # Next.js app directory
├── integration_samples/ # Integration examples
└── docs/                 # Documentation
```

## Common Tasks

### Running Voice Agent with Real Twilio

1. Set up Twilio account and get credentials
2. Update `integration_samples/twilio_example.py`
3. Set up webhook URL (use ngrok for local)
4. Run Flask app: `flask run`

### Processing Leads from Google Sheets

1. Set up Google Cloud service account
2. Download credentials JSON
3. Share spreadsheet with service account email
4. Update `lead_engine/config.json`
5. Use `lead_sources.load_from_google_sheets()`

### Adding Email Templates

1. Create templates in category-specific format
2. Store in `lead_engine/templates/` or config
3. Load in `queue_manager.add_lead_to_queue()`

## Getting Help

- Check existing documentation
- Review example code in `integration_samples/`
- Check `CONFIG.md` for configuration help
- Open an issue for bugs or feature requests

## Development Workflow

1. **Plan**: Understand the requirement
2. **Design**: Plan the implementation
3. **Code**: Write the code
4. **Test**: Write and run tests
5. **Document**: Update docs if needed
6. **Review**: Submit for review

## Best Practices

- **Keep it simple**: Don't over-engineer
- **Test first**: Write tests before or alongside code
- **Document**: Comment complex logic
- **Refactor**: Improve code quality over time
- **Security**: Never commit credentials
- **SAFE_MODE**: Always test with SAFE_MODE enabled first

