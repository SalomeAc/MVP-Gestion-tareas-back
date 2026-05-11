#!/bin/bash

# ============================================================================
# HU-03 Test Suite - Creación de Tareas
# ============================================================================
# Script para probar el endpoint POST /api/tasks
# 
# REQUISITOS PREVIOS:
# 1. Server running on http://localhost:3000
# 2. Tener un JWT_TOKEN válido
# 3. Usuario registrado y autenticado
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="http://localhost:3000/api"
# IMPORTANTE: Reemplaza este token con un token JWT válido de tu usuario
JWT_TOKEN="tu_jwt_token_aqui"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo -e "${BLUE}===============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===============================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# TEST 1: Crear tarea completa (éxito)
# ============================================================================
test_create_complete_task() {
    print_header "TEST 1: Crear tarea completa (201 Created)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Implementar HU-03",
            "description": "Crear endpoint para creación de tareas",
            "dueDate": "2024-12-31",
            "status": "pendiente"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_success "Status Code: 201 Created"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        TASK_ID=$(echo "$BODY" | jq -r '._id' 2>/dev/null)
        print_info "Task ID creado: $TASK_ID"
    else
        print_error "Status Code: $HTTP_CODE (esperado 201)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 2: Crear tarea solo con título obligatorio (éxito)
# ============================================================================
test_create_minimal_task() {
    print_header "TEST 2: Crear tarea mínima - solo título (201 Created)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea simple"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        print_success "Status Code: 201 Created"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 201)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 3: Validación - Título vacío (error 400)
# ============================================================================
test_empty_title() {
    print_header "TEST 3: Validación - Título vacío (400 Bad Request)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "",
            "description": "Sin título"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Status Code: 400 Bad Request"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 400)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 4: Validación - Título muy largo (error 400)
# ============================================================================
test_title_too_long() {
    print_header "TEST 4: Validación - Título > 100 caracteres (400 Bad Request)"
    
    LONG_TITLE="Este es un título muy largo que excede el límite de 100 caracteres permitidos en la aplicación"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"${LONG_TITLE}Este texto adicional hace que sea aún más largo\",
            \"description\": \"Descripción válida\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Status Code: 400 Bad Request"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 400)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 5: Validación - Fecha pasada (error 400)
# ============================================================================
test_past_due_date() {
    print_header "TEST 5: Validación - Fecha pasada (400 Bad Request)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea con fecha pasada",
            "dueDate": "2020-01-01"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Status Code: 400 Bad Request"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 400)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 6: Validación - Formato de fecha inválido (error 400)
# ============================================================================
test_invalid_date_format() {
    print_header "TEST 6: Validación - Formato de fecha inválido (400 Bad Request)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea con fecha inválida",
            "dueDate": "fecha-invalida"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Status Code: 400 Bad Request"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 400)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 7: Validación - Status inválido (error 400)
# ============================================================================
test_invalid_status() {
    print_header "TEST 7: Validación - Status inválido (400 Bad Request)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea con estado inválido",
            "status": "cancelada"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "400" ]; then
        print_success "Status Code: 400 Bad Request"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 400)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 8: Autenticación - Token faltante (error 401)
# ============================================================================
test_missing_token() {
    print_header "TEST 8: Autenticación - Token faltante (401 Unauthorized)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea sin autenticación"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "401" ]; then
        print_success "Status Code: 401 Unauthorized"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 401)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 9: Autenticación - Token inválido (error 403)
# ============================================================================
test_invalid_token() {
    print_header "TEST 9: Autenticación - Token inválido (403 Forbidden)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
        -H "Authorization: Bearer token_invalido_12345" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Tarea con token inválido"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "403" ]; then
        print_success "Status Code: 403 Forbidden"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status Code: $HTTP_CODE (esperado 403)"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    echo ""
}

# ============================================================================
# TEST 10: Status válidos - Todos los status permitidos
# ============================================================================
test_all_valid_status() {
    print_header "TEST 10: Status válidos - Crear tareas con todos los status"
    
    STATUSES=("pendiente" "en curso" "finalizada")
    
    for STATUS in "${STATUSES[@]}"; do
        print_info "Creando tarea con status: '$STATUS'"
        
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"title\": \"Tarea con status $STATUS\",
                \"status\": \"$STATUS\"
            }")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | sed '$d')
        
        if [ "$HTTP_CODE" = "201" ]; then
            print_success "Status '$STATUS' - 201 Created"
        else
            print_error "Status '$STATUS' - $HTTP_CODE (esperado 201)"
        fi
    done
    echo ""
}

# ============================================================================
# MAIN - Ejecutar todos los tests
# ============================================================================

main() {
    print_header "🧪 SUITE DE PRUEBAS - HU-03: CREACIÓN DE TAREAS"
    
    # Verificar si el token está configurado
    if [ "$JWT_TOKEN" = "tu_jwt_token_aqui" ]; then
        print_error "Por favor, reemplaza JWT_TOKEN con un token válido"
        exit 1
    fi
    
    # Ejecutar tests
    test_create_complete_task
    test_create_minimal_task
    test_empty_title
    test_title_too_long
    test_past_due_date
    test_invalid_date_format
    test_invalid_status
    test_missing_token
    test_invalid_token
    test_all_valid_status
    
    print_header "✅ SUITE DE PRUEBAS COMPLETADA"
}

# Ejecutar main
main
