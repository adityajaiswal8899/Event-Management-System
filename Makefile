install:
	pip install -r backend/requirements.txt && cd frontend && npm ci
migrate:
	cd backend && python manage.py migrate
dev:
	python backend/manage.py runserver & cd frontend && npm run dev
build:
	cd frontend && npm run build
test:
	python backend/manage.py test && cd frontend && npm run build
