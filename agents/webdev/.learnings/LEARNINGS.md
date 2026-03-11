# WebDev Agent Learnings

## Project Structure

```
project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── styles/
├── tests/
├── docs/
├── package.json
└── README.md
```

## Best Practices

1. **Component Design** - Single responsibility
2. **State Management** - Minimal, centralized
3. **API Design** - RESTful conventions
4. **Error Handling** - Graceful failures
5. **Performance** - Lazy loading, caching

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection (escape output)
- [ ] CSRF tokens on forms
- [ ] HTTPS only cookies
- [ ] Rate limiting on public APIs
- [ ] Environment variables for secrets
- [ ] CORS configured properly

## Performance Tips

- Minimize bundle size
- Use CDN for static assets
- Implement caching strategies
- Optimize images (WebP, lazy load)
- Code splitting
- Database query optimization
