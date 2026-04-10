# Ораториум/app/views.py

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Session
import json
from django.utils import timezone
from .recommendations import get_recommendations

# ==========================
# ВЕБ-СТРАНИЦЫ (для пользователя в браузере)
# ==========================

def menu(request):
    """Главное меню сайта"""
    context = {
        'user_name': 'Гость'
    }
    return render(request, 'menu.html', context)


def session_list(request):
    """Страница со списком всех тренировок"""
    sessions = Session.objects.all().order_by('-datetime')
    
    sessions_data = []
    for session in sessions:
        sessions_data.append({
            'id': session.id,
            'title': session.session_name,
            'date': session.datetime.isoformat(),
            'duration': session.duration,
            'finalScore': round(session.final_score or 0),
            'speechRate': session.speech_rate or 0,
            'volume': session.volume or 0,
            'eyeContact': session.eye_contact or 0,
            'parasites': session.filler_words or 0
        })
    
    context = {
        'sessions_json': json.dumps(sessions_data),
        'sessions_count': len(sessions_data)
    }
    
    return render(request, 'history.html', context)


def session_detail(request, session_id):
    """Страница с детальным отчетом по конкретной тренировке"""
    session = get_object_or_404(Session, pk=session_id)
    
    all_sessions = Session.objects.all().order_by('-datetime')
    all_sessions_data = []
    
    for s in all_sessions:
        all_sessions_data.append({
            'id': s.id,
            'title': s.session_name,
            'date': s.datetime.isoformat(),
            'duration': s.duration,
            'finalScore': round(s.final_score or 0),
            'speechRate': s.speech_rate or 0,
            'volume': s.volume or 0,
            'eyeContact': s.eye_contact or 0,
            'parasites': s.filler_words or 0
        })
    
    current_session_data = {
        'id': session.id,
        'title': session.session_name,
        'date': session.datetime.isoformat(),
        'duration': session.duration,
        'finalScore': round(session.final_score or 0),
        'speechRate': session.speech_rate or 0,
        'volume': session.volume or 0,
        'eyeContact': session.eye_contact or 0,
        'parasites': session.filler_words or 0,
        'recommendations': get_recommendations(session)
    }
    
    context = {
        'sessions_json': json.dumps(all_sessions_data),
        'session_detail_json': json.dumps(current_session_data)
    }
    
    return render(request, 'report.html', context)


# ==========================
# API ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ (для веб-интерфейса)
# ==========================

@csrf_exempt
def api_sessions(request):
    """Вернуть список всех сессий в формате JSON (для веб-интерфейса)"""
    if request.method == 'GET':
        sessions = Session.objects.all().order_by('-datetime')
        data = []
        
        for session in sessions:
            data.append({
                'id': session.id,
                'session_name': session.session_name,
                'datetime': session.datetime.isoformat(),
                'duration': session.duration,
                'speech_rate': session.speech_rate,
                'volume': session.volume,
                'eye_contact': session.eye_contact,
                'filler_words': session.filler_words,
                'final_score': round(session.final_score or 0)
            })
        
        return JsonResponse({'status': 'success', 'data': data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_session_detail(request, session_id):
    if request.method == 'GET':
        session = get_object_or_404(Session, pk=session_id)
        
        data = {
            'id': session.id,
            'session_name': session.session_name,
            'datetime': session.datetime.isoformat(),
            'duration': session.duration,
            'speech_rate': session.speech_rate,
            'volume': session.volume,
            'eye_contact': session.eye_contact,
            'filler_words': session.filler_words,
            'final_score': round(session.final_score or 0)
        }
        
        return JsonResponse({'status': 'success', 'data': data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)




# ==========================
# Создание новой сессии
# ==========================
@csrf_exempt
def create_session(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            session_name = data.get("session_name")
            
            # Если название не передано, генерируем автоматически
            if not session_name:
                session_name = f"Тренировка {timezone.now().strftime('%d.%m %H:%M')}"
            
            session = Session.objects.create(
                session_name=session_name
            )
            
            return JsonResponse({
                "status": "success",
                "session_id": session.id,
                "session_name": session.session_name
            })
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_latest_session():
    """Возвращает самую свежую сессию или None"""
    return Session.objects.order_by('-datetime').first()

# ==========================
# Unity отправляет VR данные
# ==========================
@csrf_exempt
@require_http_methods(["POST"])
def vr_data(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            session = get_latest_session()
            if not session:
                return JsonResponse({
                    "status": "error", 
                    "message": "Нет активных сессий. Сначала создайте сессию через /sessions/create/"
                }, status=404)

            if "gaze_percentage" in data:
                session.eye_contact = data["gaze_percentage"]
            if "session_duration" in data:
                session.duration = data["session_duration"]

            session.save()

            return JsonResponse({
                "status": "success",
                "final_score": session.final_score or 0,
                "message": "ok"
            })
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

# ==========================
# AI отправляет анализ речи
# ==========================
@csrf_exempt
def ai_analysis(request):
    if request.method == "POST":
        data = json.loads(request.body)

        session = get_latest_session()
        if not session:
            return JsonResponse({
                "status": "error", 
                "message": "Нет активных сессий"
            }, status=404)

        session.speech_rate = data.get("speech_rate")
        session.volume = data.get("volume")
        session.filler_words = data.get("filler_words")

        session.save()

        return JsonResponse({"status": "AI data saved"})
    
    